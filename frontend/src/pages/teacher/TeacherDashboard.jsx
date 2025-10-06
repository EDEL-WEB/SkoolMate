import { useState, useEffect } from 'react'
import { teacherAPI } from '../../utils/api'
import '../../styles/teacher-pages.css'

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await teacherAPI.getDashboard()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="teacher-loading">
      <div className="teacher-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  )

  if (!dashboardData) return (
    <div className="teacher-page">
      <div className="teacher-card">
        <h3>❌ Error</h3>
        <p>Failed to load dashboard data</p>
      </div>
    </div>
  )

  const { 
    teacher, 
    total_subjects, 
    total_students, 
    attendance_rate, 
    total_results,
    subject_averages,
    recent_results,
    low_attendance_students 
  } = dashboardData

  return (
    <div className="teacher-page fade-in">
      <div className="teacher-header">
        <h1>🎓 Welcome, {teacher.full_name}!</h1>
        <div className="subtitle">
          Department: {teacher.department?.name || 'Not assigned'} • Ready to inspire minds today?
        </div>
      </div>

      <div className="teacher-stats-grid">
        <div className="teacher-stat-card subjects">
          <span className="stat-icon">📚</span>
          <span className="stat-number">{total_subjects}</span>
          <span className="stat-label">My Subjects</span>
        </div>

        <div className="teacher-stat-card students">
          <span className="stat-icon">👥</span>
          <span className="stat-number">{total_students}</span>
          <span className="stat-label">Total Students</span>
        </div>

        <div className="teacher-stat-card attendance">
          <span className="stat-icon">📅</span>
          <span className="stat-number">{attendance_rate}%</span>
          <span className="stat-label">Attendance Rate</span>
        </div>

        <div className="teacher-stat-card results">
          <span className="stat-icon">📊</span>
          <span className="stat-number">{total_results}</span>
          <span className="stat-label">Results Recorded</span>
        </div>
      </div>

      <div className="teacher-card slide-up">
        <h3>📈 Subject Performance Overview</h3>
            {subject_averages.length > 0 ? (
              <div className="performance-grid">
                {subject_averages.map((subject, index) => (
                  <div key={index} className="performance-card">
                    <h4>{subject.subject}</h4>
                    <div className="performance-score">
                      <span className="score">{subject.average}%</span>
                      <span className="students">{subject.total_students} students</span>
                    </div>
                    <div className={`grade-indicator ${subject.average >= 80 ? 'excellent' : subject.average >= 70 ? 'good' : 'needs-improvement'}`}>
                      {subject.average >= 80 ? 'Excellent' : subject.average >= 70 ? 'Good' : 'Needs Attention'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No performance data available</p>
            )}
      </div>

      <div className="teacher-card">
        <h3>📊 Recent Results</h3>
            {recent_results.length > 0 ? (
              <div className="results-list">
                {recent_results.slice(0, 5).map((result) => (
                  <div key={result.id} className="result-item">
                    <div className="result-info">
                      <span className="student-name">{result.student?.full_name}</span>
                      <span className="exam-name">{result.exam?.name || 'Exam'}</span>
                    </div>
                    <div className="result-score">
                      <span className={`score ${result.score >= 80 ? 'excellent' : result.score >= 70 ? 'good' : 'average'}`}>
                        {result.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No recent results</p>
            )}
      </div>

      <div className="teacher-card">
        <h3>⚠️ Attendance Alerts</h3>
            {low_attendance_students.length > 0 ? (
              <div className="alerts-list">
                {low_attendance_students.map((student, index) => (
                  <div key={index} className="alert-item">
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                      <span className="student-name">{student.student}</span>
                      <span className="attendance-rate">{student.attendance_rate}% attendance</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-alerts">All students have good attendance! 🎉</p>
            )}
      </div>

      <div className="teacher-card">
        <h3>⚡ Quick Actions</h3>
        <div className="form-row">
          <button 
            className="teacher-btn primary"
            onClick={() => window.location.href = '/teacher/attendance'}
          >
            <span>📅</span>
            Mark Attendance
          </button>
          <button 
            className="teacher-btn success"
            onClick={() => window.location.href = '/teacher/results'}
          >
            <span>📊</span>
            Add Results
          </button>
          <button 
            className="teacher-btn warning"
            onClick={() => window.location.href = '/teacher/enrollment'}
          >
            <span>👥</span>
            Manage Students
          </button>
          <button 
            className="teacher-btn primary"
            onClick={() => window.location.href = '/teacher/analytics'}
          >
            <span>📈</span>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard