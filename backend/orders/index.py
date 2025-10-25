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
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными заказов
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
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
                    history
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
                    history
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
            
            cursor.execute('''
                UPDATE orders
                SET 
                    status = %s,
                    master = %s,
                    history = %s,
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
                    history
            ''', (
                body_data['status'],
                body_data.get('master'),
                json.dumps(body_data['history']),
                order_id
            ))
            
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