# Testing the Full Stack Setup

## 1. Start Both Frontend and Backend
```bash
cd frontend
npm install
npm run dev:full
```

## 2. Create Admin User (if needed)
```bash
npm run create-admin
```

## 3. Test the Setup
1. Open browser to http://localhost:3000
2. Go to /register to create a new user
3. Go to /login with credentials:
   - Email: admin@skoolmate.com  
   - Password: admin123
4. Check dashboard shows live statistics
5. Navigate to Students/Teachers pages

## 4. API Endpoints Now Available
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Proxied API: http://localhost:3000/api/*

## 5. How the Proxy Works
- Frontend request: `/api/students` 
- Vite proxy forwards to: `http://127.0.0.1:5000/students`
- Flask receives: `/students`

## 6. Troubleshooting
- Check browser console for proxy logs
- Verify backend is running on port 5000
- Check Network tab in DevTools for API calls