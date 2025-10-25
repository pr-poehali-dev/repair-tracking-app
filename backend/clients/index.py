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
    Business: API для поиска клиентов и их устройств по различным критериям
    Args: event с httpMethod, queryStringParameters (search, phone, serialNumber)
    Returns: HTTP response со списком клиентов и их устройств
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            search = params.get('search', '').strip()
            phone = params.get('phone', '').strip()
            serial_number = params.get('serialNumber', '').strip()
            
            if phone:
                cursor.execute('''
                    SELECT 
                        c.id,
                        c.full_name as "fullName",
                        c.phone,
                        c.address,
                        c.email,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', cd.id,
                                    'deviceType', cd.device_type,
                                    'deviceModel', cd.device_model,
                                    'serialNumber', cd.serial_number
                                )
                            ) FILTER (WHERE cd.id IS NOT NULL),
                            '[]'::json
                        ) as devices
                    FROM clients c
                    LEFT JOIN client_devices cd ON c.id = cd.client_id
                    WHERE c.phone ILIKE %s
                    GROUP BY c.id
                    LIMIT 10
                ''', (f'%{phone}%',))
            elif serial_number:
                cursor.execute('''
                    SELECT 
                        c.id,
                        c.full_name as "fullName",
                        c.phone,
                        c.address,
                        c.email,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', cd.id,
                                    'deviceType', cd.device_type,
                                    'deviceModel', cd.device_model,
                                    'serialNumber', cd.serial_number
                                )
                            ) FILTER (WHERE cd.id IS NOT NULL),
                            '[]'::json
                        ) as devices
                    FROM clients c
                    INNER JOIN client_devices cd ON c.id = cd.client_id
                    WHERE cd.serial_number ILIKE %s
                    GROUP BY c.id
                    LIMIT 10
                ''', (f'%{serial_number}%',))
            elif search:
                cursor.execute('''
                    SELECT 
                        c.id,
                        c.full_name as "fullName",
                        c.phone,
                        c.address,
                        c.email,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', cd.id,
                                    'deviceType', cd.device_type,
                                    'deviceModel', cd.device_model,
                                    'serialNumber', cd.serial_number
                                )
                            ) FILTER (WHERE cd.id IS NOT NULL),
                            '[]'::json
                        ) as devices
                    FROM clients c
                    LEFT JOIN client_devices cd ON c.id = cd.client_id
                    WHERE 
                        c.full_name ILIKE %s OR 
                        c.phone ILIKE %s OR 
                        c.address ILIKE %s
                    GROUP BY c.id
                    ORDER BY c.full_name
                    LIMIT 20
                ''', (f'%{search}%', f'%{search}%', f'%{search}%'))
            else:
                cursor.execute('''
                    SELECT 
                        c.id,
                        c.full_name as "fullName",
                        c.phone,
                        c.address,
                        c.email,
                        COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', cd.id,
                                    'deviceType', cd.device_type,
                                    'deviceModel', cd.device_model,
                                    'serialNumber', cd.serial_number
                                )
                            ) FILTER (WHERE cd.id IS NOT NULL),
                            '[]'::json
                        ) as devices
                    FROM clients c
                    LEFT JOIN client_devices cd ON c.id = cd.client_id
                    GROUP BY c.id
                    ORDER BY c.created_at DESC
                    LIMIT 50
                ''')
            
            clients = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(client) for client in clients], ensure_ascii=False)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            full_name = body_data.get('fullName', '').strip()
            phone = body_data.get('phone', '').strip()
            address = body_data.get('address', '').strip()
            email = body_data.get('email', '').strip()
            
            if not full_name or not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Full name and phone required'})
                }
            
            cursor.execute('''
                INSERT INTO clients (full_name, phone, address, email)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (phone) 
                DO UPDATE SET 
                    full_name = EXCLUDED.full_name,
                    address = EXCLUDED.address,
                    email = EXCLUDED.email,
                    updated_at = NOW()
                RETURNING id, full_name as "fullName", phone, address, email
            ''', (full_name, phone, address or None, email or None))
            
            client = cursor.fetchone()
            client_id = client['id']
            
            device_type = body_data.get('deviceType', '').strip()
            device_model = body_data.get('deviceModel', '').strip()
            serial_number = body_data.get('serialNumber', '').strip()
            
            if device_type:
                cursor.execute('''
                    INSERT INTO client_devices (client_id, device_type, device_model, serial_number)
                    VALUES (%s, %s, %s, %s)
                ''', (client_id, device_type, device_model or None, serial_number or None))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(client), ensure_ascii=False)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
