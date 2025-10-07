from app import create_app
from app.models import db, User
from werkzeug.security import check_password_hash

app = create_app()

with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    
    for user in users:
        print(f"User: {user.email}, Role: {user.role}")
        # Test password
        if check_password_hash(user.password, 'admin123'):
            print(f"  Password 'admin123' works for {user.email}")
        else:
            print(f"  Password 'admin123' DOES NOT work for {user.email}")