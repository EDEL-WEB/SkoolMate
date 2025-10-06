import { useState, useEffect } from 'react'
import { teacherAPI } from '../../utils/api'
import '../../styles/teacher-pages.css'

const AttendanceManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents()
    }
  }, [selectedSubject])

  const fetchSubjects = async () => {
    try {
      const response = await teacherAPI.getMySubjects()
      setSubjects(response.data)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      console.log('Fetching students for subject:', selectedSubject)
      const response = await teacherAPI.getSubjectStudents(selectedSubject)
      console.log('Students response:', response.data)
      setStudents(response.data)
      // Initialize attendance state
      const initialAttendance = {}
      response.data.forEach(student => {
        initialAttendance[student.id] = 'present'
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      alert('Failed to fetch students for this subject')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await teacherAPI.markAttendance({
        subject_id: selectedSubject,
        date: selectedDate,
        attendance: attendance
      })
      alert('Attendance marked successfully!')
    } catch (error) {
      console.error('Failed to mark attendance:', error)
      alert('Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAttendance = async (status) => {
    if (!confirm(`Mark all students as ${status}?`)) return
    
    setLoading(true)
    try {
      await teacherAPI.markBulkAttendance({
        subject_id: selectedSubject,
        date: selectedDate,
        bulk_status: status
      })
      
      // Update local state
      const updatedAttendance = {}
      students.forEach(student => {
        updatedAttendance[student.id] = status
      })
      setAttendance(updatedAttendance)
      
      alert(`All students marked as ${status}!`)
    } catch (error) {
      console.error('Failed to mark bulk attendance:', error)
      alert('Failed to mark bulk attendance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="teacher-page fade-in">
      <div className="teacher-header">
        <h1>✅ Attendance Management</h1>
        <div className="subtitle">Track and manage student attendance efficiently</div>
      </div>

      <div className="teacher-card slide-up">
        <h3>📅 Mark Attendance</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Subject</label>
            <select
              className="form-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
            >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input
              className="form-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
        </div>
          
        <div className="form-row">
          <button 
            type="button" 
            className="teacher-btn success"
            onClick={() => handleBulkAttendance('present')}
            disabled={!selectedSubject || loading}
          >
            <span>✅</span>
            Mark All Present
          </button>
          <button 
            type="button" 
            className="teacher-btn danger"
            onClick={() => handleBulkAttendance('absent')}
            disabled={!selectedSubject || loading}
          >
            <span>❌</span>
            Mark All Absent
          </button>
        </div>
      </div>

      {loading && (
        <div className="teacher-loading">
          <div className="teacher-spinner"></div>
          <p>Loading students...</p>
        </div>
      )}
      
      {selectedSubject && !loading && students.length === 0 && (
        <div className="no-students-message">
          <p>No students enrolled in this subject.</p>
        </div>
      )}
      
      {selectedSubject && students.length > 0 && !loading && (
        <div className="teacher-card">
          <h3>👥 Students - {subjects.find(s => s.id == selectedSubject)?.name}</h3>
          <form onSubmit={handleSubmit}>
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.full_name}</td>
                    <td>
                      <input
                        type="radio"
                        name={`attendance_${student.id}`}
                        value="present"
                        checked={attendance[student.id] === 'present'}
                        onChange={() => handleAttendanceChange(student.id, 'present')}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`attendance_${student.id}`}
                        value="absent"
                        checked={attendance[student.id] === 'absent'}
                        onChange={() => handleAttendanceChange(student.id, 'absent')}
                      />
                    </td>
                    <td>
                      <input
                        type="radio"
                        name={`attendance_${student.id}`}
                        value="late"
                        checked={attendance[student.id] === 'late'}
                        onChange={() => handleAttendanceChange(student.id, 'late')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="form-row">
              <button type="submit" className="teacher-btn primary" disabled={loading}>
                <span>💾</span>
                {loading ? 'Marking...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AttendanceManagement