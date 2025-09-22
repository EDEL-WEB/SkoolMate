from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# --- User Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, teacher, student

    student = db.relationship('Student', backref='user', uselist=False)
    teacher = db.relationship('Teacher', backref='user', uselist=False)

    def to_dict(self):
        return {
            "id": self.id, 
            "username": self.username,
            "email": self.email,
            "role": self.role
        }

# --- Student Model ---
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10))
    date_of_birth = db.Column(db.Date)
    parent_contact = db.Column(db.String(20))
    classroom_id = db.Column(db.Integer, db.ForeignKey('classroom.id'))
    image_url = db.Column(db.String(255), nullable=True)

    results = db.relationship('Result', backref='student', lazy=True)
    attendance_records = db.relationship('Attendance', backref='student', lazy=True)
    fees = db.relationship('Fee', backref='student', lazy=True)
    appointments = db.relationship('Appointment', backref='student', lazy=True)
    payments = db.relationship('MpesaPayment', backref='student', lazy=True)
    dorm_assignment = db.relationship('DormAssignment', backref='student', uselist=False)
    enrollments = db.relationship('Enrollment', backref='student', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "gender": self.gender,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "parent_contact": self.parent_contact,
            "classroom_id": self.classroom_id,
            "image_url": self.image_url
        }

# --- Teacher Model ---
class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    
    
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=True)

    subjects = db.relationship('Subject', backref='teacher', lazy=True)
    appointments = db.relationship('Appointment', backref='teacher', lazy=True)
    attendance_records = db.relationship('Attendance', backref='teacher', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "image_url": self.image_url,
            "department_id": self.department_id  # optionally include this
        }

# --- Classroom Model ---
class Classroom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    students = db.relationship('Student', backref='classroom', lazy=True)
    subjects = db.relationship('Subject', backref='classroom', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

# --- Appointment Model ---
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'), nullable=False)
    date = db.Column(db.String(120), nullable=False)
    time = db.Column(db.String(10), nullable=False)
    reason = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "teacher_id": self.teacher_id,
            "date": self.date,
            "time": self.time,
            "reason": self.reason
        }

# --- Subject Model ---
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'))
    classroom_id = db.Column(db.Integer, db.ForeignKey('classroom.id'))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "teacher_id": self.teacher_id,
            "classroom_id": self.classroom_id
        }

# --- Exam Model ---
class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'))
    results = db.relationship('Result', backref='exam', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "date": self.date.isoformat() if self.date else None,
            "subject_id": self.subject_id
        }

# --- Result Model ---
class Result(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    exam_id = db.Column(db.Integer, db.ForeignKey('exam.id'))
    report_id = db.Column(db.Integer, db.ForeignKey('report.id'))  # <-- Add this line
    score = db.Column(db.Float)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "exam_id": self.exam_id,
            "report_id": self.report_id,
            "score": self.score
        }


# --- Attendance Model ---
class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'))
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10))

    def to_dict(self):
        return {
            "id": self.id,
            "student": self.student.to_dict(),
            "date": self.date.isoformat(),
            "status": self.status,
            "teacher": self.teacher.to_dict()
        }

# --- Fee Model ---
class Fee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    amount = db.Column(db.Float)
    due_date = db.Column(db.Date)
    is_paid = db.Column(db.Boolean, default=False)
    

    report_id = db.Column(db.Integer, db.ForeignKey('report.id'), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "amount": self.amount,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "is_paid": self.is_paid
        }

# --- Mpesa Payment ---
class MpesaPayment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    amount = db.Column(db.Float)
    transaction_id = db.Column(db.String(100), unique=True)
    phone_number = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "amount": self.amount,
            "transaction_id": self.transaction_id,
            "phone_number": self.phone_number,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

# --- Report Model ---
class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    term = db.Column(db.String(50))
    year = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(255), nullable=True)

    student = db.relationship("Student", backref="reports")
    results = db.relationship("Result", backref="report", lazy=True)
    fee_statement = db.relationship("Fee", backref="report", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student": self.student.to_dict(),
            "term": self.term,
            "year": self.year,
            "created_at": self.created_at.isoformat(),
            "results": [r.to_dict() for r in self.results],
            "fee_statement": self.fee_statement.to_dict() if self.fee_statement else None,
            "image_url": self.image_url
        }

# --- Book Model ---
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(50), unique=True, nullable=False)
    total_copies = db.Column(db.Integer, nullable=False)
    available_copies = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "isbn": self.isbn,
            "total_copies": self.total_copies,
            "available_copies": self.available_copies
        }

# --- Borrow Record Model ---
class BorrowRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    borrowed_on = db.Column(db.DateTime, default=datetime.utcnow)
    returned_on = db.Column(db.DateTime, nullable=True)
    fine = db.Column(db.Float, default=0.0)

    student = db.relationship('Student', backref='borrow_records')
    book = db.relationship('Book', backref='borrow_records')

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "book_id": self.book_id,
            "borrowed_on": self.borrowed_on.isoformat(),
            "returned_on": self.returned_on.isoformat() if self.returned_on else None,
            "fine": self.fine
        }

# --- Dorm Room & Assignment ---
class DormRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    current_occupants = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "capacity": self.capacity,
            "current_occupants": self.current_occupants
        }

class DormAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    dorm_id = db.Column(db.Integer, db.ForeignKey('dorm_room.id'), nullable=False)
    assigned_on = db.Column(db.DateTime, default=datetime.utcnow)
    left_on = db.Column(db.DateTime, nullable=True)

    dorm = db.relationship('DormRoom', backref='assignments')

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "dorm_id": self.dorm_id,
            "assigned_on": self.assigned_on.isoformat(),
            "left_on": self.left_on.isoformat() if self.left_on else None
        }

# --- Department, Course, Enrollment ---
class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)

    teachers = db.relationship('Teacher', backref='department', lazy=True)
    courses = db.relationship('Course', backref='department', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    is_compulsory = db.Column(db.Boolean, default=False)
    group_name = db.Column(db.String(50), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=True)

    enrollments = db.relationship('Enrollment', backref='course', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_compulsory": self.is_compulsory,
            "group_name": self.group_name,
            "department_id": self.department_id
        }

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)

    subject = db.relationship('Subject', backref='enrollments')

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "subject_id": self.subject_id
        }
