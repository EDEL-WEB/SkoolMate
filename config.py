import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecret")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://postgres:password@localhost/skoolmate")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
