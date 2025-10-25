import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    '''Get database connection using DATABASE_URL from environment'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления справочником типов техники (CRUD операции)
    Args: event с httpMethod, body, queryStringParameters, headers с X-User-Role
    Returns: HTTP response с данными типов техники или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Role',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            category = params.get('category')
        
            if category:
                cursor.execute('''
                    SELECT 
                        id,
                        name,
                        category
                    FROM device_types
                    WHERE category = %s
                    ORDER BY name
                ''', (category,))
            else:
                cursor.execute('''
                    SELECT 
                        id,
                        name,
                        category
                    FROM device_types
                    ORDER BY category, name
                ''')
            
            device_types = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(dt) for dt in device_types], ensure_ascii=False)
            }
        
        elif method == 'POST':
            headers = event.get('headers', {})
            user_role = headers.get('X-User-Role') or headers.get('x-user-role')
            
            if user_role != 'director':
                return {
                    'statusCode': 403,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Forbidden: Only directors can add device types'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name', '').strip()
            category = body_data.get('category', '').strip()
            
            if not name or not category:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Name and category required'})
                }
            
            cursor.execute('''
                INSERT INTO device_types (name, category)
                VALUES (%s, %s)
                RETURNING id, name, category
            ''', (name, category))
            
            new_device_type = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_device_type), ensure_ascii=False)
            }
        
        elif method == 'DELETE':
            headers = event.get('headers', {})
            user_role = headers.get('X-User-Role') or headers.get('x-user-role')
            
            if user_role != 'director':
                return {
                    'statusCode': 403,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Forbidden: Only directors can delete device types'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            device_type_id = body_data.get('id')
            
            if not device_type_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Device type ID required'})
                }
            
            cursor.execute('DELETE FROM device_types WHERE id = %s', (device_type_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Device type deleted'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()