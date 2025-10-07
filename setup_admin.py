#!/usr/bin/env python3
"""
Simple script to ensure admin user exists with proper credentials
"""
import sqlite3
import hashlib
from werkzeug.security import generate_password_hash

# Database path
DB_PATH = '/home/elder/SkoolMate/instance/skoolmate.db'

def setup_admin():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if admin user exists
        cursor.execute("SELECT * FROM user WHERE email = ?", ('admin@skoolmate.com',))
        admin = cursor.fetchone()
        
        if admin:
            print("✅ Admin user already exists!")
            print("Email: admin@skoolmate.com")
            print("Password: admin123")
        else:
            # Create admin user
            hashed_password = generate_password_hash('admin123')
            cursor.execute("""
                INSERT INTO user (username, email, password, role) 
                VALUES (?, ?, ?, ?)
            """, ('admin', 'admin@skoolmate.com', hashed_password, 'admin'))
            
            conn.commit()
            print("✅ Admin user created successfully!")
            print("Email: admin@skoolmate.com")
            print("Password: admin123")
            print("Role: admin")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    setup_admin()