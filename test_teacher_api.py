#!/usr/bin/env python3
"""
Test teacher API endpoints
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

def test_teacher_login():
    """Test teacher login"""
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'email': 'teacher@school.com',
        'password': 'teacher123'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Teacher login successful")
        return data['access_token']
    else:
        print(f"❌ Teacher login failed: {response.text}")
        return None

def test_get_subjects(token):
    """Test getting teacher subjects"""
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/teacher/subjects', headers=headers)
    
    if response.status_code == 200:
        subjects = response.json()
        print(f"✅ Found {len(subjects)} subjects")
        for subject in subjects:
            print(f"  - {subject['name']} (ID: {subject['id']})")
        return subjects
    else:
        print(f"❌ Failed to get subjects: {response.text}")
        return []

def test_get_students(token, subject_id):
    """Test getting students for a subject"""
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/teacher/subjects/{subject_id}/students', headers=headers)
    
    if response.status_code == 200:
        students = response.json()
        print(f"✅ Found {len(students)} students for subject {subject_id}")
        for student in students:
            print(f"  - {student['full_name']} (ID: {student['id']})")
        return students
    else:
        print(f"❌ Failed to get students: {response.text}")
        return []

if __name__ == "__main__":
    print("Testing Teacher API...")
    
    # Login
    token = test_teacher_login()
    if not token:
        exit(1)
    
    # Get subjects
    subjects = test_get_subjects(token)
    if not subjects:
        exit(1)
    
    # Get students for first subject
    subject_id = subjects[0]['id']
    students = test_get_students(token, subject_id)
    
    print("\n🎉 All tests completed!")