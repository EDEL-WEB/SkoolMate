#!/usr/bin/env python3
import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app

app = create_app()

if __name__ == '__main__':
    print("🚀 Starting SkoolMate Backend...")
    print("📍 Server running on: http://localhost:5000")
    print("🔗 API endpoints available at: http://localhost:5000/auth/login")
    app.run(host='0.0.0.0', port=5000, debug=True)