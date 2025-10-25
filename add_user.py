#!/usr/bin/env python3
"""
Add a new user to the authentication system.
This script adds the user 'userna' with password '123' to the database.
"""

import sqlite3
from werkzeug.security import generate_password_hash

def add_user():
    """Add the new user to the database."""
    DB_PATH = "attendance_system.db"
    
    try:
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Create users table if it doesn't exist
        c.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL
                    )''')
        
        # Add the new user
        username = "userna"
        password = "123"
        password_hash = generate_password_hash(password)
        
        # Insert user (ignore if already exists)
        c.execute("INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)",
                  (username, password_hash))
        
        conn.commit()
        conn.close()
        
        print(f"User '{username}' with password '{password}' added successfully!")
        print("You can now login with:")
        print(f"Username: {username}")
        print(f"Password: {password}")
        
    except Exception as e:
        print(f"Error adding user: {e}")

if __name__ == "__main__":
    add_user()
