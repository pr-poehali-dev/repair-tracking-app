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
    Business: API для получения справочника типов техники
    Args: event с httpMethod, queryStringParameters (опционально category)
    Returns: HTTP response со списком типов техники
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
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
    
    finally:
        cursor.close()
        conn.close()
