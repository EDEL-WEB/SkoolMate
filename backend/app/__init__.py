from flask import Flask
from flask_cors import CORS
from .models import db
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
from . import cloudinary_config  # Initialize cloudinary config

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///skoolmate.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secret-key')

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    CORS(app)  # Enable CORS for frontend communication

    # Register blueprints
    from .routes.student_routes import student_bp
    from .routes.teacher_routes import teacher_bp
    from .routes.class_routes import class_bp
    from .routes.course_routes import course_bp
    from .routes.department_routes import department_bp
    from .routes.enrollment_routes import enrollment_bp
    from .routes.report_routes import report_bp
    from .routes.admin_routes import admin_bp
    from .routes.appointment_routes import appointment_bp
    from .routes.attendance_routes import attendance_bp
    from .routes.fees_routes import fees_bp
    from .routes.fee_routes import fee_bp
    from .routes.results_routes import results_bp
    from .routes.auth_routes import auth_bp
    from .routes.subject_routes import subject_bp

    # Remove duplicate or incorrect blueprint imports
    # 🔥 DELETE this line: from backend.app.routes.teacher_routes import teacher_bp
    # 🔥 DELETE this: from backend.app.utils.decorators import teacher_required/admin_required
    # ❗ Decorators are meant to be imported **inside** routes where used, not registered in the app

    # Register all blueprints (only once per blueprint)
    app.register_blueprint(student_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(class_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(department_bp)
    app.register_blueprint(enrollment_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(fees_bp)
    app.register_blueprint(fee_bp)
    app.register_blueprint(results_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(subject_bp)


    # Create tables if not using Alembic migrations
    with app.app_context():
        db.create_all()
   
    return app
