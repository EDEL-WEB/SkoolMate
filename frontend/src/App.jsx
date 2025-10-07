import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import StudentList from './pages/students/StudentList'
import TeacherList from './pages/teachers/TeacherList'
import DepartmentManagement from './pages/admin/DepartmentManagement'
import SubjectManagement from './pages/admin/SubjectManagement'
import TeacherRegistration from './pages/admin/TeacherRegistration'
import StudentRegistration from './pages/admin/StudentRegistration'
import DormitoryManagement from './pages/admin/DormitoryManagement'
import StudentEnrollment from './pages/teacher/StudentEnrollment'
import AttendanceManagement from './pages/teacher/AttendanceManagement'
import ResultsManagement from './pages/teacher/ResultsManagement'
import TeacherAnalytics from './pages/teacher/TeacherAnalytics'
import ClassCommunication from './pages/teacher/ClassCommunication'
import SubjectOverview from './pages/teacher/SubjectOverview'
import MyReports from './pages/student/MyReports'
import AttendanceView from './pages/student/AttendanceView'
import Timetable from './pages/student/Timetable'
import FeeManagement from './pages/student/FeeManagement'
import UserManagement from './pages/admin/UserManagement'
import Settings from './pages/admin/Settings'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route 
              path="students" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <StudentList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teachers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeacherList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="departments" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DepartmentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="subjects" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SubjectManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="register-teacher" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeacherRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="register-student" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="enrollment" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <StudentEnrollment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="attendance" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <AttendanceManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher-results" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <ResultsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/enrollment" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <StudentEnrollment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/attendance" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <AttendanceManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/results" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <ResultsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/analytics" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/communication" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <ClassCommunication />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="teacher/subject/:subjectId" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <SubjectOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/reports" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/attendance" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AttendanceView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/timetable" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Timetable />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="student/fees" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <FeeManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-reports" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="dormitories" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DormitoryManagement />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App