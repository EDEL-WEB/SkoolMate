#!/usr/bin/env python3
"""
Create test data for teacher dashboard testing
"""
import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime, date

DB_PATH = '/home/elder/SkoolMate/instance/skoolmate.db'

def create_test_data():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create test teacher user
        cursor.execute("SELECT id FROM user WHERE email = ?", ('teacher@school.com',))
        teacher_user = cursor.fetchone()
        
        if not teacher_user:
            cursor.execute("""
                INSERT INTO user (username, email, password, role) 
                VALUES (?, ?, ?, ?)
            """, ('teacher1', 'teacher@school.com', generate_password_hash('teacher123'), 'teacher'))
            teacher_user_id = cursor.lastrowid
        else:
            teacher_user_id = teacher_user[0]
        
        # Create teacher record
        cursor.execute("SELECT id FROM teacher WHERE user_id = ?", (teacher_user_id,))
        teacher = cursor.fetchone()
        
        if not teacher:
            cursor.execute("""
                INSERT INTO teacher (user_id, full_name) 
                VALUES (?, ?)
            """, (teacher_user_id, 'John Teacher'))
            teacher_id = cursor.lastrowid
        else:
            teacher_id = teacher[0]
        
        # Create test classroom
        cursor.execute("SELECT id FROM classroom WHERE name = ?", ('Class 10A',))
        classroom = cursor.fetchone()
        
        if not classroom:
            cursor.execute("INSERT INTO classroom (name) VALUES (?)", ('Class 10A',))
            classroom_id = cursor.lastrowid
        else:
            classroom_id = classroom[0]
        
        # Create test subject
        cursor.execute("SELECT id FROM subject WHERE name = ? AND teacher_id = ?", ('Mathematics', teacher_id))
        subject = cursor.fetchone()
        
        if not subject:
            cursor.execute("""
                INSERT INTO subject (name, teacher_id, classroom_id) 
                VALUES (?, ?, ?)
            """, ('Mathematics', teacher_id, classroom_id))
            subject_id = cursor.lastrowid
        else:
            subject_id = subject[0]
        
        # Create test students
        for i in range(1, 6):
            # Create student user
            email = f'student{i}@school.com'
            cursor.execute("SELECT id FROM user WHERE email = ?", (email,))
            student_user = cursor.fetchone()
            
            if not student_user:
                cursor.execute("""
                    INSERT INTO user (username, email, password, role) 
                    VALUES (?, ?, ?, ?)
                """, (f'student{i}', email, generate_password_hash('student123'), 'student'))
                student_user_id = cursor.lastrowid
            else:
                student_user_id = student_user[0]
            
            # Create student record
            cursor.execute("SELECT id FROM student WHERE user_id = ?", (student_user_id,))
            student = cursor.fetchone()
            
            if not student:
                cursor.execute("""
                    INSERT INTO student (user_id, full_name, classroom_id) 
                    VALUES (?, ?, ?)
                """, (student_user_id, f'Student {i}', classroom_id))
                student_id = cursor.lastrowid
            else:
                student_id = student[0]
            
            # Enroll student in subject
            cursor.execute("SELECT id FROM enrollment WHERE student_id = ? AND subject_id = ?", (student_id, subject_id))
            enrollment = cursor.fetchone()
            
            if not enrollment:
                cursor.execute("""
                    INSERT INTO enrollment (student_id, subject_id) 
                    VALUES (?, ?)
                """, (student_id, subject_id))
        
        # Create test exam
        cursor.execute("SELECT id FROM exam WHERE name = ? AND subject_id = ?", ('Mid Term Test', subject_id))
        exam = cursor.fetchone()
        
        if not exam:
            cursor.execute("""
                INSERT INTO exam (name, subject_id) 
                VALUES (?, ?)
            """, ('Mid Term Test', subject_id))
            exam_id = cursor.lastrowid
        else:
            exam_id = exam[0]
        
        # Create test results
        cursor.execute("SELECT id FROM student LIMIT 5")
        students = cursor.fetchall()
        
        scores = [85, 78, 92, 67, 73]
        for i, (student_id,) in enumerate(students):
            if i < len(scores):
                cursor.execute("SELECT id FROM result WHERE student_id = ? AND exam_id = ?", (student_id, exam_id))
                result = cursor.fetchone()
                
                if not result:
                    cursor.execute("""
                        INSERT INTO result (student_id, exam_id, score) 
                        VALUES (?, ?, ?)
                    """, (student_id, exam_id, scores[i]))
        
        conn.commit()
        conn.close()
        
        print("✅ Test data created successfully!")
        print("Teacher login: teacher@school.com / teacher123")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    create_test_data()