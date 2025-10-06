import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminAPI, studentsAPI, teachersAPI, teacherAPI } from '../utils/api'
import StudentDashboard from './student/StudentDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
import AdminDashboard from './admin/AdminDashboard'
import '../styles/dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_subjects: 0,
    total_departments: 0
  })
  const [departments, setDepartments] = useState([])
  const [newDeptName, setNewDeptName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'admin') {
          const [dashboardRes, deptsRes] = await Promise.all([
            adminAPI.getDashboard(),
            adminAPI.getDepartments()
          ])
          setStats(dashboardRes.data.statistics || stats)
          setDepartments(deptsRes.data)
        } else if (user?.role === 'teacher') {
          // For teachers, get their specific data
          const [subjectsRes, enrollmentsRes] = await Promise.all([
            teacherAPI.getMySubjects().catch(() => ({ data: [] })),
            teacherAPI.getEnrollments().catch(() => ({ data: [] }))
          ])
          setStats({
            my_subjects: subjectsRes.data.length,
            my_students: enrollmentsRes.data.length,
            total_subjects: 0,
            total_departments: 0
          })
        } else {
          // For students
          setStats({
            total_students: 0,
            total_teachers: 0,
            total_subjects: 0,
            total_departments: 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleAddDepartment = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAPI.createDepartment({ name: newDeptName })
      setNewDeptName('')
      // Refresh departments
      const response = await adminAPI.getDepartments()
      setDepartments(response.data)
      alert('Department added successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add department')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="dashboard"><p>Loading dashboard...</p></div>
  }

  // Show role-specific dashboards
  if (user?.role === 'student') {
    return <StudentDashboard />
  }
  
  if (user?.role === 'teacher') {
    return <TeacherDashboard />
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.username}! ({user?.role})</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>My Students</h3>
          <p className="stat-number">{stats.my_students || 0}</p>
        </div>
        <div className="stat-card">
          <h3>My Subjects</h3>
          <p className="stat-number">{stats.my_subjects || 0}</p>
        </div>
        {user?.role === 'admin' && (
          <>
            <div className="stat-card">
              <h3>Subjects</h3>
              <p className="stat-number">{stats.total_subjects}</p>
            </div>
            <div className="stat-card">
              <h3>Departments</h3>
              <p className="stat-number">{stats.total_departments}</p>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-content">
        {user?.role === 'admin' && (
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <div className="action-card">
                <h3>Add Department</h3>
                <form onSubmit={handleAddDepartment} className="inline-form">
                  <input
                    type="text"
                    placeholder="Department Name"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </form>
              </div>
              
              <div className="action-card">
                <h3>Departments</h3>
                <div className="dept-list">
                  {departments.map((dept) => (
                    <span key={dept.id} className="dept-tag">{dept.name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          {user?.role === 'admin' ? (
            <p>Admin dashboard with full system access.</p>
          ) : user?.role === 'teacher' ? (
            <p>Teacher dashboard - manage your classes and students.</p>
          ) : (
            <p>Student dashboard - view your progress and information.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard