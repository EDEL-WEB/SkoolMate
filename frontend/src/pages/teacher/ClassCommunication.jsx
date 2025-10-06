import { useState, useEffect } from 'react'
import { teacherAPI } from '../../utils/api'
import '../../styles/class-communication.css'

const ClassCommunication = () => {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [students, setStudents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    priority: 'normal'
  })
  const [selectedStudents, setSelectedStudents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjects()
    loadMockAnnouncements()
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
      if (response.data.length > 0) {
        setSelectedSubject(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await teacherAPI.getSubjectStudents(selectedSubject)
      setStudents(response.data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const loadMockAnnouncements = () => {
    // Mock announcements - in real app, fetch from API
    const mockAnnouncements = [
      {
        id: 1,
        title: 'Upcoming Test',
        message: 'Mathematics test scheduled for next Friday. Please review chapters 5-7.',
        priority: 'high',
        date: new Date().toISOString(),
        recipients: 25
      },
      {
        id: 2,
        title: 'Assignment Reminder',
        message: 'Physics assignment due tomorrow. Submit your lab reports.',
        priority: 'normal',
        date: new Date(Date.now() - 86400000).toISOString(),
        recipients: 30
      }
    ]
    setAnnouncements(mockAnnouncements)
  }

  const handleSendAnnouncement = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock sending announcement
      const announcement = {
        id: Date.now(),
        ...newAnnouncement,
        date: new Date().toISOString(),
        recipients: selectedStudents.length || students.length
      }
      
      setAnnouncements(prev => [announcement, ...prev])
      setNewAnnouncement({ title: '', message: '', priority: 'normal' })
      setSelectedStudents([])
      
      alert('Announcement sent successfully!')
    } catch (error) {
      alert('Failed to send announcement')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id))
  }

  const clearSelection = () => {
    setSelectedStudents([])
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c'
      case 'medium': return '#f39c12'
      default: return '#3498db'
    }
  }

  return (
    <div className="class-communication">
      <div className="communication-header">
        <h1>Class Communication</h1>
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

      <div className="communication-content">
        <div className="announcement-form">
          <h2>Send Announcement</h2>
          <form onSubmit={handleSendAnnouncement}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Announcement Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Message content..."
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
              >
                <option value="normal">Normal Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="recipients-section">
              <h3>Recipients ({selectedStudents.length || students.length} students)</h3>
              <div className="recipient-controls">
                <button type="button" onClick={selectAllStudents} className="btn btn-sm">
                  Select All
                </button>
                <button type="button" onClick={clearSelection} className="btn btn-sm">
                  Clear Selection
                </button>
              </div>
              
              <div className="students-grid">
                {students.map((student) => (
                  <label key={student.id} className="student-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                    />
                    <span>{student.full_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Announcement'}
            </button>
          </form>
        </div>

        <div className="announcements-history">
          <h2>Recent Announcements</h2>
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-card">
                <div className="announcement-header">
                  <h3>{announcement.title}</h3>
                  <div 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                  >
                    {announcement.priority}
                  </div>
                </div>
                <p className="announcement-message">{announcement.message}</p>
                <div className="announcement-footer">
                  <span className="announcement-date">
                    {new Date(announcement.date).toLocaleDateString()}
                  </span>
                  <span className="announcement-recipients">
                    📤 {announcement.recipients} recipients
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassCommunication