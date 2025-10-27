import json
import os
from typing import Dict, Any, List
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    '''Get database connection using DATABASE_URL from environment'''
    return psycopg2.connect(os.environ['DATABASE_URL'])

def decimal_default(obj):
    '''JSON encoder for Decimal objects'''
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления заказами (создание, чтение, обновление статусов)
    Args: event с httpMethod, body, queryStringParameters, headers с X-User-Id
    Returns: HTTP response с данными заказов пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action')
        
        if action == 'search-chat':
            if method == 'GET':
                search_query = query_params.get('q', '').strip()
                if not search_query or len(search_query) < 2:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps([])
                    }
                
                cursor.execute('''
                    SELECT DISTINCT order_id
                    FROM order_chat_messages
                    WHERE LOWER(message) LIKE LOWER(%s)
                    ORDER BY order_id
                ''', (f'%{search_query}%',))
                
                matches = cursor.fetchall()
                order_ids = [row['order_id'] for row in matches]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps(order_ids, ensure_ascii=False)
                }
        
        if action == 'chat':
            if method == 'GET':
                order_id = query_params.get('orderId')
                if not order_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'orderId required'})
                    }
                
                cursor.execute('''
                    SELECT 
                        ocm.id, 
                        ocm.order_id, 
                        ocm.user_id, 
                        ocm.user_name, 
                        ocm.message, 
                        ocm.timestamp, 
                        ocm.is_read,
                        u.avatar_url
                    FROM order_chat_messages ocm
                    LEFT JOIN users u ON CAST(ocm.user_id AS INTEGER) = u.id
                    WHERE ocm.order_id = %s
                    ORDER BY ocm.timestamp ASC
                ''', (order_id,))
                
                messages = cursor.fetchall()
                
                result = []
                for msg in messages:
                    result.append({
                        'id': str(msg['id']),
                        'orderId': msg['order_id'],
                        'userId': str(msg['user_id']),
                        'userName': msg['user_name'],
                        'userAvatar': msg['avatar_url'],
                        'message': msg['message'],
                        'timestamp': msg['timestamp'].isoformat() if msg['timestamp'] else None,
                        'isRead': msg['is_read']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps(result, ensure_ascii=False)
                }
            
            elif method == 'POST':
                body_data = json.loads(event.get('body', '{}'))
                
                order_id = body_data.get('orderId')
                message_user_id = body_data.get('userId')
                user_name = body_data.get('userName')
                message = body_data.get('message')
                
                if not all([order_id, message_user_id, user_name, message]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'})
                    }
                
                cursor.execute('''
                    INSERT INTO order_chat_messages (order_id, user_id, user_name, message, timestamp, is_read)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (order_id, message_user_id, user_name, message, datetime.now(), False))
                
                message_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'id': str(message_id), 'success': True})
                }
        
        if method == 'GET':
            if user_id:
                cursor.execute('''
                    SELECT 
                        o.order_id as "id",
                        o.client_name as "clientName",
                        o.client_address as "clientAddress",
                        o.client_phone as "clientPhone",
                        o.device_type as "deviceType",
                        o.device_model as "deviceModel",
                        o.serial_number as "serialNumber",
                        o.issue,
                        o.appearance,
                        o.accessories,
                        o.status,
                        o.priority,
                        o.repair_type as "repairType",
                        TO_CHAR(o.created_at, 'DD.MM.YYYY') as "createdAt",
                        o.created_time as "createdTime",
                        o.price,
                        o.master,
                        o.history,
                        o.repair_description as "repairDescription",
                        TO_CHAR(o.status_deadline, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusDeadline",
                        TO_CHAR(o.status_changed_at, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusChangedAt",
                        o.is_overdue as "isOverdue"
                    FROM orders o
                    INNER JOIN order_users ou ON o.id = ou.order_id
                    WHERE ou.user_id = %s
                    ORDER BY o.created_at DESC
                ''', (int(user_id),))
            else:
                cursor.execute('''
                    SELECT 
                        order_id as "id",
                        client_name as "clientName",
                        client_address as "clientAddress",
                        client_phone as "clientPhone",
                        device_type as "deviceType",
                        device_model as "deviceModel",
                        serial_number as "serialNumber",
                        issue,
                        appearance,
                        accessories,
                        status,
                        priority,
                        repair_type as "repairType",
                        TO_CHAR(created_at, 'DD.MM.YYYY') as "createdAt",
                        created_time as "createdTime",
                        price,
                        master,
                        history,
                        repair_description as "repairDescription",
                        TO_CHAR(status_deadline, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusDeadline",
                        TO_CHAR(status_changed_at, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusChangedAt",
                        is_overdue as "isOverdue"
                    FROM orders
                    ORDER BY created_at DESC
                ''')
            orders = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(order) for order in orders], ensure_ascii=False, default=decimal_default)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO orders (
                    order_id, client_name, client_address, client_phone,
                    device_type, device_model, serial_number, issue,
                    appearance, accessories, status, priority,
                    repair_type, created_time, price, master, history
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING 
                    id as db_id,
                    order_id as "id",
                    client_name as "clientName",
                    client_address as "clientAddress",
                    client_phone as "clientPhone",
                    device_type as "deviceType",
                    device_model as "deviceModel",
                    serial_number as "serialNumber",
                    issue,
                    appearance,
                    accessories,
                    status,
                    priority,
                    repair_type as "repairType",
                    TO_CHAR(created_at, 'DD.MM.YYYY') as "createdAt",
                    created_time as "createdTime",
                    price,
                    master,
                    history,
                    repair_description as "repairDescription",
                    TO_CHAR(status_deadline, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusDeadline",
                    TO_CHAR(status_changed_at, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusChangedAt",
                    is_overdue as "isOverdue"
            ''', (
                body_data['id'],
                body_data['clientName'],
                body_data['clientAddress'],
                body_data['clientPhone'],
                body_data['deviceType'],
                body_data['deviceModel'],
                body_data['serialNumber'],
                body_data['issue'],
                body_data['appearance'],
                body_data['accessories'],
                body_data['status'],
                body_data['priority'],
                body_data['repairType'],
                body_data['createdTime'],
                body_data.get('price'),
                body_data.get('master'),
                json.dumps(body_data['history'])
            ))
            
            new_order = cursor.fetchone()
            new_order_id = new_order['db_id']
            
            if user_id:
                cursor.execute('''
                    INSERT INTO order_users (order_id, user_id, role)
                    VALUES (%s, %s, 'creator')
                ''', (new_order_id, int(user_id)))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_order), ensure_ascii=False, default=decimal_default)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('id')
            
            cursor.execute('SELECT status FROM orders WHERE order_id = %s', (order_id,))
            old_status_row = cursor.fetchone()
            old_status = old_status_row['status'] if old_status_row else None
            new_status = body_data['status']
            
            status_deadline = body_data.get('statusDeadline')
            
            cursor.execute('''
                UPDATE orders
                SET 
                    status = %s,
                    master = %s,
                    history = %s,
                    repair_description = %s,
                    status_deadline = %s,
                    status_changed_at = NOW(),
                    is_overdue = (CASE WHEN %s::timestamp IS NOT NULL AND NOW() > %s::timestamp THEN true ELSE false END),
                    updated_at = NOW()
                WHERE order_id = %s
                RETURNING 
                    order_id as "id",
                    client_name as "clientName",
                    client_address as "clientAddress",
                    client_phone as "clientPhone",
                    device_type as "deviceType",
                    device_model as "deviceModel",
                    serial_number as "serialNumber",
                    issue,
                    appearance,
                    accessories,
                    status,
                    priority,
                    repair_type as "repairType",
                    TO_CHAR(created_at, 'DD.MM.YYYY') as "createdAt",
                    created_time as "createdTime",
                    price,
                    master,
                    history,
                    repair_description as "repairDescription",
                    TO_CHAR(status_deadline, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusDeadline",
                    TO_CHAR(status_changed_at, 'YYYY-MM-DD"T"HH24:MI:SS') as "statusChangedAt",
                    is_overdue as "isOverdue"
            ''', (
                new_status,
                body_data.get('master'),
                json.dumps(body_data['history']),
                body_data.get('repairDescription'),
                status_deadline,
                status_deadline,
                status_deadline,
                order_id
            ))
            
            if old_status and old_status != new_status:
                cursor.execute('SELECT EXTRACT(EPOCH FROM (NOW() - status_changed_at))/3600 FROM orders WHERE order_id = %s', (order_id,))
                duration_result = cursor.fetchone()
                duration_hours = int(duration_result[0]) if duration_result and duration_result[0] else 0
                
                cursor.execute('SELECT is_overdue FROM orders WHERE order_id = %s', (order_id,))
                overdue_result = cursor.fetchone()
                was_overdue = overdue_result['is_overdue'] if overdue_result else False
                
                cursor.execute('''
                    INSERT INTO status_history (order_id, old_status, new_status, changed_by, duration_hours, was_overdue)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (order_id, old_status, new_status, body_data.get('changedBy', 'Система'), duration_hours, was_overdue))
            
            updated_order = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_order), ensure_ascii=False, default=decimal_default)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()