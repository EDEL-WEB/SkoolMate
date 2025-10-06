import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'
import '../../styles/student-dashboard.css'

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await studentAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  if (!dashboardData) return <div className="error">Failed to load dashboard</div>

  const { student, gpa, attendance_rate, total_subjects, unpaid_fees, recent_results } = dashboardData

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {student.full_name}!</h1>
        <p className="class-info">Class: {student.classroom?.name || 'Not assigned'}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card gpa">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Current GPA</h3>
            <p className="stat-number">{gpa}</p>
            <span className={`grade ${gpa >= 3.5 ? 'excellent' : gpa >= 2.5 ? 'good' : 'needs-improvement'}`}>
              {gpa >= 3.5 ? 'Excellent' : gpa >= 2.5 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        <div className="stat-card attendance">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Attendance</h3>
            <p className="stat-number">{attendance_rate}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: `${attendance_rate}%`}}></div>
            </div>
          </div>
        </div>

        <div className="stat-card subjects">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Subjects</h3>
            <p className="stat-number">{total_subjects}</p>
            <span className="stat-label">Enrolled</span>
          </div>
        </div>

        <div className="stat-card fees">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Pending Fees</h3>
            <p className="stat-number">{unpaid_fees}</p>
            <span className={`stat-label ${unpaid_fees > 0 ? 'warning' : 'success'}`}>
              {unpaid_fees > 0 ? 'Action Required' : 'All Paid'}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-results">
          <h2>Recent Results</h2>
          {recent_results.length > 0 ? (
            <div className="results-grid">
              {recent_results.map((result) => (
                <div key={result.id} className="result-card">
                  <h4>{result.exam?.subject?.name || 'Subject'}</h4>
                  <div className="score">{result.score}%</div>
                  <div className={`grade ${result.score >= 80 ? 'a' : result.score >= 70 ? 'b' : result.score >= 60 ? 'c' : 'd'}`}>
                    {result.score >= 80 ? 'A' : result.score >= 70 ? 'B' : result.score >= 60 ? 'C' : result.score >= 50 ? 'D' : 'F'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No recent results available</p>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => window.location.href = '/student/reports'}>
              📄 View Reports
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/student/fees'}>
              💳 Pay Fees
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/student/attendance'}>
              📊 View Attendance
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/student/timetable'}>
              🗓️ Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard