import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "medicheck.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name  TEXT,
            batch          TEXT,
            expiry         TEXT,
            manufacturer   TEXT,
            status         TEXT,
            days           INTEGER,
            authenticity   TEXT,
            confidence     INTEGER,
            category       TEXT,
            recommendation TEXT,
            timestamp      DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_history(data: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO history
            (medicine_name, batch, expiry, manufacturer, status, days,
             authenticity, confidence, category, recommendation)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (
        data.get("name", "Unknown"),
        data.get("batch", "N/A"),
        data.get("expiry", "N/A"),
        data.get("manufacturer", "N/A"),
        data.get("status", "Unknown"),
        data.get("days"),
        data.get("authenticity", "Unknown"),
        data.get("confidence", 0),
        data.get("category", ""),
        data.get("recommendation", ""),
    ))
    conn.commit()
    conn.close()

def get_history():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT id, medicine_name, batch, expiry, manufacturer,
               status, days, authenticity, confidence, category,
               recommendation, timestamp
        FROM history ORDER BY id DESC
    """)
    rows = c.fetchall()
    conn.close()
    return [
        {
            "id": r[0], "name": r[1], "batch": r[2], "expiry": r[3],
            "manufacturer": r[4], "status": r[5], "days": r[6],
            "authenticity": r[7], "confidence": r[8], "category": r[9],
            "recommendation": r[10], "timestamp": r[11],
        }
        for r in rows
    ]