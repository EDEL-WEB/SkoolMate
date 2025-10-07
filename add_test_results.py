#!/usr/bin/env python3
"""
Add test results for the Mathematics subject
"""
import sqlite3

DB_PATH = '/home/elder/SkoolMate/instance/skoolmate.db'

def add_test_results():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get Mathematics subject ID
        cursor.execute("SELECT id FROM subject WHERE name = 'Mathematics' AND teacher_id = 3")
        subject = cursor.fetchone()
        
        if not subject:
            print("❌ Mathematics subject not found for teacher")
            return
        
        subject_id = subject[0]
        print(f"Found Mathematics subject with ID: {subject_id}")
        
        # Create additional exams
        exams = [
            ('Mid Term Test', subject_id),
            ('Final Exam', subject_id),
            ('Quiz 1', subject_id)
        ]
        
        exam_ids = []
        for exam_name, subj_id in exams:
            cursor.execute("SELECT id FROM exam WHERE name = ? AND subject_id = ?", (exam_name, subj_id))
            exam = cursor.fetchone()
            
            if not exam:
                cursor.execute("INSERT INTO exam (name, subject_id) VALUES (?, ?)", (exam_name, subj_id))
                exam_id = cursor.lastrowid
                print(f"Created exam: {exam_name} with ID: {exam_id}")
            else:
                exam_id = exam[0]
                print(f"Found existing exam: {exam_name} with ID: {exam_id}")
            
            exam_ids.append(exam_id)
        
        # Get enrolled students
        cursor.execute("""
            SELECT s.id, s.full_name 
            FROM student s 
            JOIN enrollment e ON s.id = e.student_id 
            WHERE e.subject_id = ?
        """, (subject_id,))
        students = cursor.fetchall()
        
        print(f"Found {len(students)} enrolled students")
        
        # Add results for each student and exam
        test_scores = [
            [85, 78, 92],  # Student 1 scores for 3 exams
            [76, 82, 88],  # Student 2 scores
            [92, 89, 95],  # Student 3 scores
            [67, 71, 74],  # Student 4 scores
            [73, 77, 80]   # Student 5 scores
        ]
        
        for i, (student_id, student_name) in enumerate(students):
            if i < len(test_scores):
                for j, exam_id in enumerate(exam_ids):
                    if j < len(test_scores[i]):
                        # Check if result already exists
                        cursor.execute("""
                            SELECT id FROM result 
                            WHERE student_id = ? AND exam_id = ?
                        """, (student_id, exam_id))
                        
                        if not cursor.fetchone():
                            score = test_scores[i][j]
                            cursor.execute("""
                                INSERT INTO result (student_id, exam_id, score) 
                                VALUES (?, ?, ?)
                            """, (student_id, exam_id, score))
                            print(f"Added result: {student_name} - {score}% for exam {exam_id}")
        
        conn.commit()
        conn.close()
        
        print("✅ Test results added successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_test_results()