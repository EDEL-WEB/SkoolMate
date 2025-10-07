#!/usr/bin/env python3
import sqlite3
from werkzeug.security import check_password_hash

DB_PATH = '/home/elder/SkoolMate/instance/skoolmate.db'

def check_users():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, username, email, role, password FROM user")
        users = cursor.fetchall()
        
        print(f"Total users: {len(users)}")
        print("-" * 50)
        
        for user in users:
            user_id, username, email, role, password_hash = user
            print(f"ID: {user_id}")
            print(f"Username: {username}")
            print(f"Email: {email}")
            print(f"Role: {role}")
            
            # Test common passwords
            test_passwords = ['admin123', 'password', '123456']
            for pwd in test_passwords:
                if check_password_hash(password_hash, pwd):
                    print(f"✅ Password '{pwd}' works!")
                    break
            else:
                print("❌ None of the test passwords work")
            
            print("-" * 30)
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()