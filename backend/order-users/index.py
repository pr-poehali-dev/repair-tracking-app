import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    '''Get database connection using DATABASE_URL from environment'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления участниками заказов (добавление/удаление пользователей)
    Args: event с httpMethod, body, pathParams
    Returns: HTTP response с данными участников заказа
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
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            order_id = params.get('orderId')
            
            if not order_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'orderId required'})
                }
            
            cursor.execute('''
                SELECT 
                    o.id,
                    o.order_id as "orderId"
                FROM orders o
                WHERE o.order_id = %s
            ''', (order_id,))
            order_row = cursor.fetchone()
            
            if not order_row:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Order not found'})
                }
            
            cursor.execute('''
                SELECT 
                    ou.id,
                    ou.user_id as "userId",
                    u.username,
                    u.full_name as "fullName",
                    u.role,
                    ou.role as "assignmentRole",
                    TO_CHAR(ou.added_at, 'DD.MM.YYYY HH24:MI') as "addedAt"
                FROM order_users ou
                INNER JOIN users u ON ou.user_id = u.id
                WHERE ou.order_id = %s
                ORDER BY ou.added_at DESC
            ''', (order_row['id'],))
            users = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(user) for user in users], ensure_ascii=False)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('orderId')
            user_id = body_data.get('userId')
            role = body_data.get('role', 'assigned')
            
            if not order_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'orderId and userId required'})
                }
            
            cursor.execute('SELECT id FROM orders WHERE order_id = %s', (order_id,))
            order_row = cursor.fetchone()
            
            if not order_row:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Order not found'})
                }
            
            cursor.execute('''
                INSERT INTO order_users (order_id, user_id, role)
                VALUES (%s, %s, %s)
                ON CONFLICT (order_id, user_id) DO NOTHING
                RETURNING id
            ''', (order_row['id'], int(user_id), role))
            
            result = cursor.fetchone()
            conn.commit()
            
            if result:
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'User added to order'})
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'User already in order'})
                }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('orderId')
            user_id = body_data.get('userId')
            
            if not order_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'orderId and userId required'})
                }
            
            cursor.execute('SELECT id FROM orders WHERE order_id = %s', (order_id,))
            order_row = cursor.fetchone()
            
            if not order_row:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Order not found'})
                }
            
            cursor.execute('''
                DELETE FROM order_users
                WHERE order_id = %s AND user_id = %s
            ''', (order_row['id'], int(user_id)))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'User removed from order'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
