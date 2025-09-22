from backend.app import create_app  # ✅ Fix this import

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
