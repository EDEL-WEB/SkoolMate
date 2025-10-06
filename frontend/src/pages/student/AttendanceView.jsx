import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'
import '../../styles/attendance-view.css'

const AttendanceView = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await studentAPI.getMyAttendance()
      setAttendance(response.data)
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceStats = () => {
    const total = attendance.length
    const present = attendance.filter(a => a.status === 'present').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const late = attendance.filter(a => a.status === 'late').length
    
    return {
      total,
      present,
      absent,
      late,
      percentage: total > 0 ? ((present / total) * 100).toFixed(1) : 0
    }
  }

  const filteredAttendance = attendance.filter(a => 
    filter === 'all' || a.status === filter
  )

  const stats = getAttendanceStats()

  if (loading) return <div className="loading">Loading attendance...</div>

  return (
    <div className="attendance-view">
      <div className="attendance-header">
        <h1>My Attendance</h1>
        <div className="attendance-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.percentage}%</span>
            <span className="stat-label">Overall</span>
          </div>
          <div className="stat-item present">
            <span className="stat-value">{stats.present}</span>
            <span className="stat-label">Present</span>
          </div>
          <div className="stat-item absent">
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-label">Absent</span>
          </div>
          <div className="stat-item late">
            <span className="stat-value">{stats.late}</span>
            <span className="stat-label">Late</span>
          </div>
        </div>
      </div>

      <div className="attendance-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({attendance.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'present' ? 'active' : ''}`}
          onClick={() => setFilter('present')}
        >
          Present ({stats.present})
        </button>
        <button 
          className={`filter-btn ${filter === 'absent' ? 'active' : ''}`}
          onClick={() => setFilter('absent')}
        >
          Absent ({stats.absent})
        </button>
        <button 
          className={`filter-btn ${filter === 'late' ? 'active' : ''}`}
          onClick={() => setFilter('late')}
        >
          Late ({stats.late})
        </button>
      </div>

      <div className="attendance-list">
        {filteredAttendance.length > 0 ? (
          <div className="attendance-grid">
            {filteredAttendance.map((record) => (
              <div key={record.id} className={`attendance-card ${record.status}`}>
                <div className="attendance-date">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className={`attendance-status ${record.status}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </div>
                <div className="attendance-teacher">
                  Marked by: {record.teacher?.full_name || 'System'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>No attendance records found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceView