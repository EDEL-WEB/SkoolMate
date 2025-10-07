from backend.app import create_app
from backend.app.models import db, User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Check if admin user exists
    admin = User.query.filter_by(email='admin@skoolmate.com').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@skoolmate.com',
            password=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created successfully!")
    else:
        print("ℹ️  Admin user already exists!")
    
    print("\n🔑 Login Credentials:")
    print("Email: admin@skoolmate.com")
    print("Password: admin123")
    print("Role: admin")