import { useState, useEffect } from 'react'
import { teacherAPI } from '../../utils/api'
import '../../styles/teacher-analytics.css'

const TeacherAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchAnalytics()
    }
  }, [selectedSubject])

  const fetchSubjects = async () => {
    try {
      const response = await teacherAPI.getMySubjects()
      setSubjects(response.data)
      if (response.data.length > 0) {
        setSelectedSubject(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        teacherAPI.getSubjectStudents(selectedSubject),
        teacherAPI.getSubjectResults(selectedSubject)
      ])
      
      const students = studentsRes.data
      const results = resultsRes.data
      
      // Calculate analytics
      const totalStudents = students.length
      const totalResults = results.length
      const averageScore = results.length > 0 
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length 
        : 0
      
      // Grade distribution
      const gradeDistribution = {
        A: results.filter(r => r.score >= 80).length,
        B: results.filter(r => r.score >= 70 && r.score < 80).length,
        C: results.filter(r => r.score >= 60 && r.score < 70).length,
        D: results.filter(r => r.score >= 50 && r.score < 60).length,
        F: results.filter(r => r.score < 50).length
      }
      
      // Top performers
      const topPerformers = results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(r => ({
          student: r.student?.full_name || 'Unknown',
          score: r.score,
          exam: r.exam?.name || 'Exam'
        }))
      
      // Students needing attention (below 60%)
      const needsAttention = results
        .filter(r => r.score < 60)
        .map(r => ({
          student: r.student?.full_name || 'Unknown',
          score: r.score,
          exam: r.exam?.name || 'Exam'
        }))
      
      setAnalyticsData({
        totalStudents,
        totalResults,
        averageScore: Math.round(averageScore * 10) / 10,
        gradeDistribution,
        topPerformers,
        needsAttention
      })
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading analytics...</div>

  return (
    <div className="teacher-analytics">
      <div className="analytics-header">
        <h1>Class Analytics</h1>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="subject-selector"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {analyticsData && (
        <>
          <div className="analytics-overview">
            <div className="overview-card">
              <h3>Total Students</h3>
              <div className="overview-number">{analyticsData.totalStudents}</div>
            </div>
            <div className="overview-card">
              <h3>Results Recorded</h3>
              <div className="overview-number">{analyticsData.totalResults}</div>
            </div>
            <div className="overview-card">
              <h3>Class Average</h3>
              <div className="overview-number">{analyticsData.averageScore}%</div>
            </div>
            <div className="overview-card">
              <h3>Pass Rate</h3>
              <div className="overview-number">
                {analyticsData.totalResults > 0 
                  ? Math.round(((analyticsData.totalResults - analyticsData.gradeDistribution.F) / analyticsData.totalResults) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          <div className="analytics-content">
            <div className="grade-distribution">
              <h2>Grade Distribution</h2>
              <div className="grade-chart">
                {Object.entries(analyticsData.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="grade-bar">
                    <div className="grade-label">{grade}</div>
                    <div className="grade-bar-container">
                      <div 
                        className={`grade-bar-fill grade-${grade.toLowerCase()}`}
                        style={{
                          width: analyticsData.totalResults > 0 
                            ? `${(count / analyticsData.totalResults) * 100}%` 
                            : '0%'
                        }}
                      ></div>
                    </div>
                    <div className="grade-count">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="performance-sections">
              <div className="top-performers">
                <h2>Top Performers</h2>
                {analyticsData.topPerformers.length > 0 ? (
                  <div className="performers-list">
                    {analyticsData.topPerformers.map((performer, index) => (
                      <div key={index} className="performer-item">
                        <div className="performer-rank">#{index + 1}</div>
                        <div className="performer-info">
                          <span className="performer-name">{performer.student}</span>
                          <span className="performer-exam">{performer.exam}</span>
                        </div>
                        <div className="performer-score">{performer.score}%</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No results available</p>
                )}
              </div>

              <div className="needs-attention">
                <h2>Needs Attention</h2>
                {analyticsData.needsAttention.length > 0 ? (
                  <div className="attention-list">
                    {analyticsData.needsAttention.map((student, index) => (
                      <div key={index} className="attention-item">
                        <div className="attention-icon">⚠️</div>
                        <div className="attention-info">
                          <span className="attention-name">{student.student}</span>
                          <span className="attention-exam">{student.exam}</span>
                        </div>
                        <div className="attention-score">{student.score}%</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">All students performing well! 🎉</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TeacherAnalytics