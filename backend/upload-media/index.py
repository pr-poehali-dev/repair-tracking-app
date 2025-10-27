import json
import base64
import os
import uuid
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload and manage media files (photos/videos) for repair orders
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response with file URL or list of media files
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    if method == 'GET':
        return get_order_media(event, headers)
    elif method == 'POST':
        return upload_media(event, headers)
    elif method == 'DELETE':
        return delete_media(event, headers)
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'})
    }


def get_order_media(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    order_id = params.get('orderId')
    
    if not order_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'orderId is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute('''
            SELECT id, order_id, file_url, file_type, file_name, 
                   file_size, uploaded_by, uploaded_at, description
            FROM order_media
            WHERE order_id = %s
            ORDER BY uploaded_at DESC
        ''', (order_id,))
        
        rows = cursor.fetchall()
        
        media_list = []
        for row in rows:
            media_list.append({
                'id': row['id'],
                'orderId': row['order_id'],
                'fileUrl': row['file_url'],
                'fileType': row['file_type'],
                'fileName': row['file_name'],
                'fileSize': row['file_size'],
                'uploadedBy': row['uploaded_by'],
                'uploadedAt': row['uploaded_at'].isoformat() if row['uploaded_at'] else None,
                'description': row['description']
            })
        
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps(media_list)
        }
    finally:
        cursor.close()
        conn.close()


def upload_media(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    order_id = body_data.get('orderId')
    file_base64 = body_data.get('fileData')
    file_name = body_data.get('fileName')
    file_type = body_data.get('fileType', 'image')
    uploaded_by = body_data.get('uploadedBy', 'Unknown')
    description = body_data.get('description', '')
    
    if not all([order_id, file_base64, file_name]):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing required fields: orderId, fileData, fileName'})
        }
    
    try:
        file_data = base64.b64decode(file_base64)
        file_size = len(file_data)
        
        file_ext = file_name.split('.')[-1].lower() if '.' in file_name else 'jpg'
        unique_name = f"order-{order_id}/{uuid.uuid4()}.{file_ext}"
        
        s3_bucket = os.environ.get('S3_BUCKET', 'poehali-files')
        s3_endpoint = os.environ.get('S3_ENDPOINT', 'https://storage.yandexcloud.net')
        
        s3_client = boto3.client(
            's3',
            endpoint_url=s3_endpoint,
            aws_access_key_id=os.environ.get('S3_ACCESS_KEY'),
            aws_secret_access_key=os.environ.get('S3_SECRET_KEY')
        )
        
        content_type_map = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime'
        }
        content_type = content_type_map.get(file_ext, 'application/octet-stream')
        
        s3_client.put_object(
            Bucket=s3_bucket,
            Key=unique_name,
            Body=file_data,
            ContentType=content_type,
            ACL='public-read'
        )
        
        file_url = f"{s3_endpoint}/{s3_bucket}/{unique_name}"
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute('''
            INSERT INTO order_media 
            (order_id, file_url, file_type, file_name, file_size, uploaded_by, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (order_id, file_url, file_type, file_name, file_size, uploaded_by, description))
        
        result = cursor.fetchone()
        media_id = result['id']
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'id': media_id,
                'fileUrl': file_url,
                'fileName': file_name,
                'fileType': file_type,
                'fileSize': file_size,
                'success': True
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def delete_media(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    params = event.get('queryStringParameters', {}) or {}
    media_id = params.get('id')
    
    if not media_id:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'id is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute('SELECT file_url FROM order_media WHERE id = %s', (media_id,))
        row = cursor.fetchone()
        
        if not row:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Media not found'})
            }
        
        cursor.execute('DELETE FROM order_media WHERE id = %s', (media_id,))
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True})
        }
    finally:
        cursor.close()
        conn.close()
