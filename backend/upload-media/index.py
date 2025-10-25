'''
Business: Upload and manage media files (images/videos) for repair orders
Args: event - dict with httpMethod, body (multipart form data or JSON for listing)
      context - object with attributes: request_id, function_name
Returns: HTTP response with file URL or list of media files
'''

import json
import base64
import os
import uuid
from typing import Dict, Any, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'})
    }


def get_order_media(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    import psycopg2
    
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
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id, order_id, file_url, file_type, file_name, 
               file_size, uploaded_by, uploaded_at, description
        FROM order_media
        WHERE order_id = %s
        ORDER BY uploaded_at DESC
    ''' % order_id)
    
    rows = cur.fetchall()
    
    media_list = []
    for row in rows:
        media_list.append({
            'id': row[0],
            'orderId': row[1],
            'fileUrl': row[2],
            'fileType': row[3],
            'fileName': row[4],
            'fileSize': row[5],
            'uploadedBy': row[6],
            'uploadedAt': row[7].isoformat() if row[7] else None,
            'description': row[8]
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(media_list)
    }


def upload_media(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    import psycopg2
    import boto3
    
    body_data = json.loads(event.get('body', '{}'))
    
    order_id = body_data.get('orderId')
    file_base64 = body_data.get('fileData')
    file_name = body_data.get('fileName')
    file_type = body_data.get('fileType')
    uploaded_by = body_data.get('uploadedBy')
    description = body_data.get('description', '')
    
    if not all([order_id, file_base64, file_name, file_type]):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing required fields'})
        }
    
    file_data = base64.b64decode(file_base64)
    file_size = len(file_data)
    
    file_ext = file_name.split('.')[-1] if '.' in file_name else 'jpg'
    unique_name = f"order-{order_id}/{uuid.uuid4()}.{file_ext}"
    
    s3_bucket = os.environ.get('S3_BUCKET', 'poehali-files')
    s3_endpoint = os.environ.get('S3_ENDPOINT', 'https://storage.yandexcloud.net')
    
    s3_client = boto3.client(
        's3',
        endpoint_url=s3_endpoint,
        aws_access_key_id=os.environ.get('S3_ACCESS_KEY'),
        aws_secret_access_key=os.environ.get('S3_SECRET_KEY')
    )
    
    content_type = 'image/jpeg' if file_type == 'image' else 'video/mp4'
    
    s3_client.put_object(
        Bucket=s3_bucket,
        Key=unique_name,
        Body=file_data,
        ContentType=content_type
    )
    
    file_url = f"{s3_endpoint}/{s3_bucket}/{unique_name}"
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO order_media 
        (order_id, file_url, file_type, file_name, file_size, uploaded_by, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    ''' % (order_id, repr(file_url), repr(file_type), repr(file_name), 
           file_size, repr(uploaded_by) if uploaded_by else 'NULL', repr(description)))
    
    media_id = cur.fetchone()[0]
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'id': media_id,
            'fileUrl': file_url,
            'fileName': file_name,
            'fileType': file_type,
            'fileSize': file_size
        })
    }
