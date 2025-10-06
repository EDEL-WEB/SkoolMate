import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { teacherAPI } from '../../utils/api'
import './SubjectOverview.css'

const SubjectOverview = () => {
  const { subjectId } = useParams()
  const [subjectData, setSubjectData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubjectData()
  }, [subjectId])

  const fetchSubjectData = async () => {
    try {
      setLoading(true)
      const response = await teacherAPI.getSubjectOverview(subjectId)
      setSubjectData(response.data)
    } catch (error) {
      setError('Failed to load subject data')
      console.error('Error fetching subject data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="subject-overview">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading subject data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="subject-overview">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchSubjectData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="subject-overview">
      <div className="subject-header">
        <div className="subject-info">
          <h1>{subjectData.subject.name}</h1>
          <p className="subject-code">Code: {subjectData.subject.code}</p>
        </div>
        <div className="subject-stats">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-content">
              <span className="stat-number">{subjectData.student_count}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-content">
              <span className="stat-number">{subjectData.average_score}%</span>
              <span className="stat-label">Avg Score</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <div className="stat-content">
              <span className="stat-number">{subjectData.total_results}</span>
              <span className="stat-label">Results</span>
            </div>
          </div>
        </div>
      </div>

      <div className="subject-actions">
        <Link 
          to={`/teacher/subjects/${subjectId}/students`} 
          className="action-btn primary"
        >
          <span className="btn-icon">👥</span>
          Manage Students
        </Link>
        <Link 
          to="/teacher/attendance" 
          className="action-btn secondary"
        >
          <span className="btn-icon">✅</span>
          Mark Attendance
        </Link>
        <Link 
          to="/teacher/results" 
          className="action-btn secondary"
        >
          <span className="btn-icon">📊</span>
          Enter Results
        </Link>
      </div>

      <div className="recent-results">
        <h3>Recent Results</h3>
        {subjectData.recent_results.length > 0 ? (
          <div className="results-list">
            {subjectData.recent_results.map((result) => (
              <div key={result.id} className="result-item">
                <div className="result-info">
                  <span className="student-name">Student ID: {result.student_id}</span>
                  <span className="exam-name">{result.exam_name || 'Exam'}</span>
                </div>
                <div className="result-score">
                  <span className={`score ${result.score >= 70 ? 'good' : result.score >= 50 ? 'average' : 'poor'}`}>
                    {result.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No results recorded yet</p>
            <Link to="/teacher/results" className="add-results-btn">
              Add First Result
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubjectOverview