import json
import os
import sqlite3
import hashlib
import binascii
from datetime import datetime
from wsgiref.simple_server import make_server

DB_PATH = os.path.join(os.path.dirname(__file__), 'users.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_db():
    conn = get_db_connection()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')
    conn.commit()
    conn.close()

def hash_password(password: str, salt: bytes = None) -> str:
    if salt is None:
        salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{binascii.hexlify(salt).decode('ascii')}:{binascii.hexlify(pwd_hash).decode('ascii')}"

def verify_password(stored_hash: str, password: str) -> bool:
    salt_hex, pwd_hash_hex = stored_hash.split(':')
    salt = binascii.unhexlify(salt_hex)
    expected = binascii.unhexlify(pwd_hash_hex)
    test_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return hmac_compare(expected, test_hash)

def hmac_compare(a: bytes, b: bytes) -> bool:
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a, b):
        result |= x ^ y
    return result == 0

def create_user(full_name: str, email: str, password: str):
    conn = get_db_connection()
    password_hash = hash_password(password)
    created_at = datetime.utcnow().isoformat() + 'Z'
    try:
        conn.execute(
            "INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (full_name, email.lower(), password_hash, created_at)
        )
        conn.commit()
        return True, None
    except sqlite3.IntegrityError as e:
        return False, 'Email already registered.'
    finally:
        conn.close()

def verify_user(email: str, password: str):
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
    conn.close()

    if not user:
        return False, 'Invalid email or password.'

    if verify_password(user['password_hash'], password):
        return True, user
    return False, 'Invalid email or password.'

def parse_request_body(env):
    try:
        request_body_size = int(env.get('CONTENT_LENGTH', 0))
    except (ValueError):
        request_body_size = 0

    if request_body_size > 0:
        request_body = env['wsgi.input'].read(request_body_size)
        return json.loads(request_body.decode('utf-8'))
    return {}

def json_response(start_response, body, status='200 OK'):
    response_body = json.dumps(body).encode('utf-8')
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type'),
    ]
    start_response(status, headers)
    return [response_body]


def application(env, start_response):
    path = env.get('PATH_INFO', '/')
    method = env.get('REQUEST_METHOD', 'GET')

    if path == '/api/signup' and method == 'POST':
        payload = parse_request_body(env)
        full_name = payload.get('fullName')
        email = payload.get('email')
        password = payload.get('password')

        if not full_name or not email or not password:
            return json_response(start_response, {'error': 'missing fields'}, '400 Bad Request')

        success, error = create_user(full_name, email, password)
        if not success:
            return json_response(start_response, {'error': error}, '400 Bad Request')

        return json_response(start_response, {'message': 'account created'}, '201 Created')

    if path == '/api/login' and method == 'POST':
        payload = parse_request_body(env)
        email = payload.get('email')
        password = payload.get('password')

        if not email or not password:
            return json_response(start_response, {'error': 'missing fields'}, '400 Bad Request')

        valid, result = verify_user(email, password)
        if not valid:
            return json_response(start_response, {'error': result}, '401 Unauthorized')

        return json_response(start_response, {'message': 'login successful', 'user': {'id': result['id'], 'full_name': result['full_name'], 'email': result['email']}})

    if method == 'OPTIONS' and path.startswith('/api/'):
        start_response('204 No Content', [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type'),
        ])
        return [b'']

    if path == '/api/health':
        return json_response(start_response, {'status': 'ok'})

    return json_response(start_response, {'error': 'not found'}, '404 Not Found')

if __name__ == '__main__':
    create_db()
    print(f'SQLite database initialized at {DB_PATH}')
    with make_server('0.0.0.0', 8000, application) as server:
        print('Server running at http://0.0.0.0:8000')
        server.serve_forever()