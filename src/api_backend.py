import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from werkzeug.utils import secure_filename
import threading
from utils import load_config
import precompute_embeddings
from dotenv import load_dotenv
import yaml

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Secret key from environment
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'PLACEHOLDER_SECRET_KEY')

DB_PATH = "attendance_system.db"

# ---------------- Database Initialization ----------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Students table
    c.execute('''CREATE TABLE IF NOT EXISTS students (
                    roll_no TEXT PRIMARY KEY,
                    name TEXT NOT NULL
                )''')

    # Cameras table
    c.execute('''CREATE TABLE IF NOT EXISTS cameras (
                    camera_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    ip_address TEXT NOT NULL
                )''')

    # Attendance table
    c.execute('''CREATE TABLE IF NOT EXISTS attendance (
                    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    roll_no TEXT NOT NULL,
                    camera_id INTEGER NOT NULL,
                    detected_time TEXT NOT NULL,
                    date TEXT NOT NULL,
                    FOREIGN KEY (roll_no) REFERENCES students (roll_no),
                    FOREIGN KEY (camera_id) REFERENCES cameras (camera_id)
                )''')

    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL
                )''')

    # Dataset table for storing uploaded images
    c.execute('''CREATE TABLE IF NOT EXISTS dataset (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_roll_no TEXT NOT NULL,
                    image_path TEXT NOT NULL,
                    uploaded_at TEXT NOT NULL,
                    FOREIGN KEY (student_roll_no) REFERENCES students (roll_no)
                )''')

    # Training sessions table
    c.execute('''CREATE TABLE IF NOT EXISTS training_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    started_at TEXT NOT NULL,
                    completed_at TEXT,
                    status TEXT NOT NULL,
                    total_images INTEGER,
                    trained_persons INTEGER,
                    model_path TEXT
                )''')

    # Preload users from environment variables (placeholders for GitHub)
    users = [
        (os.getenv("EMAIL1", "EMAIL1_PLACEHOLDER"), os.getenv("PWD1", "PWD1_PLACEHOLDER")),
        (os.getenv("EMAIL2", "EMAIL2_PLACEHOLDER"), os.getenv("PWD2", "PWD2_PLACEHOLDER")),
        (os.getenv("EMAIL3", "EMAIL3_PLACEHOLDER"), os.getenv("PWD3", "PWD3_PLACEHOLDER")),
        (os.getenv("EMAIL4", "EMAIL4_PLACEHOLDER"), os.getenv("PWD4", "PWD4_PLACEHOLDER"))
    ]

    for email, pwd in users:
        if email and pwd:
            c.execute("INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)",
                      (email, generate_password_hash(pwd)))

    conn.commit()
    conn.close()
    print("✅ Database initialized with authentication users (placeholders).")


# ---------------- JWT Token Protection ----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        # Handle both "Bearer <token>" and direct token formats
        if token.startswith('Bearer '):
            token = token[7:]  # Remove "Bearer " prefix
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = data['email']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


# ---------------- Authentication ----------------
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=?", (email,))
    user = c.fetchone()
    conn.close()

    if not user or not check_password_hash(user[2], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user[0],
        'email': user[1],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=4)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token})


# ---------------- Students ----------------
@app.route('/students', methods=['GET'])
@token_required
def get_students(current_user):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM students")
    students = [{'roll_no': row[0], 'name': row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(students)


@app.route('/students', methods=['POST'])
@token_required
def add_student(current_user):
    data = request.get_json()
    roll_no = data.get('roll_no')
    name = data.get('name')
    if not roll_no or not name:
        return jsonify({'error': 'Missing fields'}), 400
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO students (roll_no, name) VALUES (?, ?)", (roll_no, name))
    conn.commit()
    conn.close()
    return jsonify({'message': f'Student {name} added successfully'})


# ---------------- Cameras ----------------
@app.route('/cameras', methods=['GET'])
@token_required
def get_cameras(current_user):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT camera_id, ip_address, name FROM cameras")
    cameras = [{'camera_id': row[0], 'ip_address': row[1], 'name': row[2] or f'Camera-{row[0]}'} for row in c.fetchall()]
    conn.close()
    return jsonify(cameras)


@app.route('/cameras', methods=['POST'])
@token_required
def add_camera(current_user):
    data = request.get_json()
    name = data.get('name')
    ip_address = data.get('ip_address')
    
    if not name or not ip_address:
        return jsonify({'error': 'Missing name or IP address'}), 400
    
    # Add to database
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO cameras (ip_address, name) VALUES (?, ?)", (ip_address, name))
    camera_id = c.lastrowid
    conn.commit()
    conn.close()
    
    # Update config.yaml
    try:
        update_config_yaml(name, ip_address)
    except Exception as e:
        print(f"Warning: Could not update config.yaml: {e}")
    
    return jsonify({'message': f'Camera {name} added successfully', 'camera_id': camera_id})


def update_config_yaml(camera_name, camera_source):
    """Add a new camera to config.yaml"""
    config_path = "config.yaml"
    
    try:
        # Read existing config
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f) or {}
        
        # Get existing camera sources
        camera_sources = config.get('CAMERA_SOURCES', [])
        
        # Check if camera already exists (by name or source)
        exists = any(
            cam.get('name') == camera_name or cam.get('source') == camera_source
            for cam in camera_sources
        )
        
        if not exists:
            # Add new camera
            camera_sources.append({
                'name': camera_name,
                'source': camera_source
            })
            config['CAMERA_SOURCES'] = camera_sources
            
            # Write back to file
            with open(config_path, 'w', encoding='utf-8') as f:
                yaml.dump(config, f, default_flow_style=False, sort_keys=False)
            
            print(f"✅ Added {camera_name} to config.yaml")
        else:
            print(f"ℹ️ Camera {camera_name} already exists in config.yaml")
    
    except Exception as e:
        print(f"❌ Error updating config.yaml: {e}")
        raise


# ---------------- Attendance ----------------
@app.route('/attendance', methods=['GET'])
@token_required
def get_attendance(current_user):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM attendance")
    rows = c.fetchall()
    conn.close()
    records = [{'attendance_id': r[0], 'roll_no': r[1], 'camera_id': r[2],
                'detected_time': r[3], 'date': r[4]} for r in rows]
    return jsonify(records)


@app.route('/attendance', methods=['POST'])
@token_required
def mark_attendance(current_user):
    data = request.get_json()
    roll_no = data.get('roll_no')
    camera_id = data.get('camera_id')
    if not roll_no or not camera_id:
        return jsonify({'error': 'Missing fields'}), 400

    now = datetime.datetime.now()
    date = now.strftime("%Y-%m-%d")
    detected_time = now.strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM attendance WHERE roll_no=? AND date=? AND camera_id=?",
              (roll_no, date, camera_id))
    if c.fetchone():
        conn.close()
        return jsonify({'message': 'Attendance already marked for today'}), 200

    c.execute("INSERT INTO attendance (roll_no, camera_id, detected_time, date) VALUES (?, ?, ?, ?)",
              (roll_no, camera_id, detected_time, date))
    conn.commit()
    conn.close()
    return jsonify({'message': f'Attendance logged for {roll_no} at {detected_time}'})


@app.route('/attendance/<int:attendance_id>', methods=['DELETE'])
@token_required
def delete_attendance(current_user, attendance_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if the record exists
    c.execute("SELECT * FROM attendance WHERE attendance_id=?", (attendance_id,))
    record = c.fetchone()
    
    if not record:
        conn.close()
        return jsonify({'error': 'Attendance record not found'}), 404
    
    # Delete the record
    c.execute("DELETE FROM attendance WHERE attendance_id=?", (attendance_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Attendance record deleted successfully'})


# Public endpoint for face recognition system (no authentication required)
@app.route('/attendance/mark', methods=['POST'])
def mark_attendance_public():
    data = request.get_json()
    roll_no = data.get('roll_no') or data.get('name')
    camera_id = data.get('camera_id', 1)
    
    if not roll_no:
        return jsonify({'error': 'Missing roll_no or name'}), 400

    now = datetime.datetime.now()
    date = now.strftime("%Y-%m-%d")
    detected_time = now.strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Check if already marked today
    c.execute("SELECT * FROM attendance WHERE roll_no=? AND date=? AND camera_id=?",
              (roll_no, date, camera_id))
    if c.fetchone():
        conn.close()
        return jsonify({'message': 'Attendance already marked for today', 'success': True}), 200

    # Add student if not exists
    c.execute("INSERT OR IGNORE INTO students (roll_no, name) VALUES (?, ?)", (roll_no, roll_no))
    
    # Mark attendance
    c.execute("INSERT INTO attendance (roll_no, camera_id, detected_time, date) VALUES (?, ?, ?, ?)",
              (roll_no, camera_id, detected_time, date))
    conn.commit()
    conn.close()
    
    return jsonify({'message': f'Attendance logged for {roll_no} at {detected_time}', 'success': True})


@app.route('/')
def home():
    return jsonify({'message': 'Secure Face Recognition Attendance API Running ✅'})


# ---------------- Dataset Management (list / upload / delete / train) ----------------
@app.route('/dataset/list', methods=['GET'])
@token_required
def dataset_list(current_user):
    config = load_config()
    if not config:
        return jsonify({'error': 'Config not found'}), 500

    dataset_dir = config['PATHS'].get('DATASET_DIR', 'dataset')
    os.makedirs(dataset_dir, exist_ok=True)

    persons = []
    for entry in os.scandir(dataset_dir):
        if entry.is_dir():
            images = [f for f in os.listdir(entry.path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            persons.append({'name': entry.name, 'image_count': len(images), 'images': images})

    return jsonify(persons)


@app.route('/dataset/upload', methods=['POST'])
@token_required
def dataset_upload(current_user):
    label = request.form.get('label')
    files = request.files.getlist('images')

    if not label or not files:
        return jsonify({'error': 'Label and image files are required'}), 400

    config = load_config()
    if not config:
        return jsonify({'error': 'Config not found'}), 500

    dataset_dir = config['PATHS'].get('DATASET_DIR', 'dataset')
    person_dir = os.path.join(dataset_dir, label)
    os.makedirs(person_dir, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    saved_files = []
    for f in files:
        filename = secure_filename(f.filename)
        if not filename:
            continue
        dest_path = os.path.join(person_dir, filename)
        # Avoid overwriting by appending counter if exists
        base, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(dest_path):
            filename = f"{base}_{counter}{ext}"
            dest_path = os.path.join(person_dir, filename)
            counter += 1

        f.save(dest_path)
        saved_files.append(dest_path)

        # Record in DB
        uploaded_at = datetime.datetime.utcnow().isoformat()
        c.execute("INSERT INTO dataset (student_roll_no, image_path, uploaded_at) VALUES (?, ?, ?)",
                  (label, dest_path, uploaded_at))

    conn.commit()
    conn.close()

    # Attempt to run training (precompute embeddings). Run synchronously and return success/failure.
    try:
        precompute_embeddings.precompute_embeddings()
        return jsonify({'message': f'Uploaded {len(saved_files)} images for {label}', 'training_completed': True})
    except Exception as e:
        # If training fails, still return success for upload but indicate training error
        return jsonify({'message': f'Uploaded {len(saved_files)} images for {label}', 'training_completed': False, 'training_error': str(e)}), 500


@app.route('/dataset/<string:person_name>', methods=['DELETE'])
@token_required
def dataset_delete(current_user, person_name):
    config = load_config()
    if not config:
        return jsonify({'error': 'Config not found'}), 500

    dataset_dir = config['PATHS'].get('DATASET_DIR', 'dataset')
    person_dir = os.path.join(dataset_dir, person_name)

    # Remove files and DB entries
    try:
        if os.path.exists(person_dir) and os.path.isdir(person_dir):
            for root, dirs, files in os.walk(person_dir, topdown=False):
                for name in files:
                    try:
                        os.remove(os.path.join(root, name))
                    except Exception:
                        pass
                for name in dirs:
                    try:
                        os.rmdir(os.path.join(root, name))
                    except Exception:
                        pass
            try:
                os.rmdir(person_dir)
            except Exception:
                pass

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM dataset WHERE student_roll_no=?", (person_name,))
        conn.commit()
        conn.close()

        # Retrain
        try:
            precompute_embeddings.precompute_embeddings()
            return jsonify({'message': f'Deleted {person_name} and retrained', 'training_completed': True})
        except Exception as e:
            return jsonify({'message': f'Deleted {person_name} but retraining failed', 'training_completed': False, 'training_error': str(e)}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/dataset/train', methods=['POST'])
@token_required
def dataset_train(current_user):
    try:
        precompute_embeddings.precompute_embeddings()
        return jsonify({'message': 'Training completed', 'training_completed': True})
    except Exception as e:
        return jsonify({'message': 'Training failed', 'training_completed': False, 'training_error': str(e)}), 500


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)

