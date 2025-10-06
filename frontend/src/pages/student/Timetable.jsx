import { useState, useEffect } from 'react'
import '../../styles/timetable.css'

const Timetable = () => {
  const [timetable, setTimetable] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock timetable data - in real app, fetch from API
    const mockTimetable = {
      Monday: [
        { time: '8:00-9:00', subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101' },
        { time: '9:00-10:00', subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102' },
        { time: '10:30-11:30', subject: 'Physics', teacher: 'Dr. Brown', room: 'Lab 1' },
        { time: '11:30-12:30', subject: 'Chemistry', teacher: 'Ms. Davis', room: 'Lab 2' }
      ],
      Tuesday: [
        { time: '8:00-9:00', subject: 'Biology', teacher: 'Dr. Wilson', room: 'Lab 3' },
        { time: '9:00-10:00', subject: 'History', teacher: 'Mr. Taylor', room: 'Room 201' },
        { time: '10:30-11:30', subject: 'Geography', teacher: 'Ms. Anderson', room: 'Room 202' },
        { time: '11:30-12:30', subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101' }
      ],
      Wednesday: [
        { time: '8:00-9:00', subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102' },
        { time: '9:00-10:00', subject: 'Physics', teacher: 'Dr. Brown', room: 'Lab 1' },
        { time: '10:30-11:30', subject: 'Art', teacher: 'Ms. White', room: 'Art Room' },
        { time: '11:30-12:30', subject: 'PE', teacher: 'Coach Miller', room: 'Gym' }
      ],
      Thursday: [
        { time: '8:00-9:00', subject: 'Chemistry', teacher: 'Ms. Davis', room: 'Lab 2' },
        { time: '9:00-10:00', subject: 'Mathematics', teacher: 'Mr. Smith', room: 'Room 101' },
        { time: '10:30-11:30', subject: 'Biology', teacher: 'Dr. Wilson', room: 'Lab 3' },
        { time: '11:30-12:30', subject: 'Computer Science', teacher: 'Mr. Garcia', room: 'Computer Lab' }
      ],
      Friday: [
        { time: '8:00-9:00', subject: 'History', teacher: 'Mr. Taylor', room: 'Room 201' },
        { time: '9:00-10:00', subject: 'Geography', teacher: 'Ms. Anderson', room: 'Room 202' },
        { time: '10:30-11:30', subject: 'English', teacher: 'Ms. Johnson', room: 'Room 102' },
        { time: '11:30-12:30', subject: 'Study Hall', teacher: 'Various', room: 'Library' }
      ]
    }
    
    setTimeout(() => {
      setTimetable(mockTimetable)
      setLoading(false)
    }, 1000)
  }, [])

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const isCurrentClass = (timeSlot) => {
    const currentTime = getCurrentTime()
    const [startTime] = timeSlot.split('-')
    const [endTime] = timeSlot.split('-')[1]
    return currentTime >= startTime && currentTime <= endTime
  }

  if (loading) return <div className="loading">Loading timetable...</div>

  const currentDay = getCurrentDay()
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <h1>My Timetable</h1>
        <div className="current-info">
          <span className="current-day">Today: {currentDay}</span>
          <span className="current-time">Time: {getCurrentTime()}</span>
        </div>
      </div>

      <div className="timetable-grid">
        {weekdays.map(day => (
          <div key={day} className={`day-column ${day === currentDay ? 'current-day' : ''}`}>
            <div className="day-header">
              <h3>{day}</h3>
              {day === currentDay && <span className="today-badge">Today</span>}
            </div>
            
            <div className="classes-list">
              {timetable[day]?.map((classItem, index) => (
                <div 
                  key={index} 
                  className={`class-card ${day === currentDay && isCurrentClass(classItem.time) ? 'current-class' : ''}`}
                >
                  <div className="class-time">{classItem.time}</div>
                  <div className="class-subject">{classItem.subject}</div>
                  <div className="class-teacher">{classItem.teacher}</div>
                  <div className="class-room">{classItem.room}</div>
                  {day === currentDay && isCurrentClass(classItem.time) && (
                    <div className="live-indicator">Live Now</div>
                  )}
                </div>
              )) || (
                <div className="no-classes">No classes scheduled</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="timetable-legend">
        <div className="legend-item">
          <div className="legend-color current"></div>
          <span>Current Class</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today's Classes</span>
        </div>
      </div>
    </div>
  )
}

export default Timetable