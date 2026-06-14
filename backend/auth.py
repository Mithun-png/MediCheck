import sqlite3
import jwt
import datetime
import os
from pathlib import Path
from flask import jsonify
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "medicheck-secret")
DB_PATH = Path(__file__).parent / "medicheck.db"

def register_user(data):
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
        return jsonify({"message": "Signup successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    finally:
        conn.close()

def login_user(data):
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE username=? AND password=?", (username, password))
    user = c.fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    payload = {
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return jsonify({"token": token, "username": username})

def verify_token(token):
    if not token:
        return False
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return True
    except Exception:
        return False