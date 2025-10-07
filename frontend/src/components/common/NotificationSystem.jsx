import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './NotificationSystem.css'

const NotificationSystem = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      generateNotifications()
    }
  }, [user])

  const generateNotifications = () => {
    let mockNotifications = []
    
    if (user?.role === 'student') {
      mockNotifications = [
        {
          id: 1,
          type: 'grade',
          title: 'New Grade Posted',
          message: 'Your Mathematics exam result is now available',
          time: '2 hours ago',
          read: false
        },
        {
          id: 2,
          type: 'fee',
          title: 'Fee Payment Reminder',
          message: 'Term 2 fees are due in 5 days',
          time: '1 day ago',
          read: false
        },
        {
          id: 3,
          type: 'attendance',
          title: 'Attendance Alert',
          message: 'Your attendance is below 75%',
          time: '3 days ago',
          read: true
        }
      ]
    } else if (user?.role === 'teacher') {
      mockNotifications = [
        {
          id: 1,
          type: 'assignment',
          title: 'Assignment Submissions',
          message: '15 new assignments submitted for review',
          time: '1 hour ago',
          read: false
        },
        {
          id: 2,
          type: 'attendance',
          title: 'Low Attendance Alert',
          message: '3 students have attendance below 75%',
          time: '4 hours ago',
          read: false
        },
        {
          id: 3,
          type: 'meeting',
          title: 'Faculty Meeting',
          message: 'Department meeting scheduled for tomorrow 2 PM',
          time: '1 day ago',
          read: true
        },
        {
          id: 4,
          type: 'grade',
          title: 'Grade Deadline',
          message: 'Submit grades for Physics by Friday',
          time: '2 days ago',
          read: false
        }
      ]
    } else if (user?.role === 'admin') {
      mockNotifications = [
        {
          id: 1,
          type: 'system',
          title: 'System Backup Complete',
          message: 'Daily backup completed successfully',
          time: '30 minutes ago',
          read: false
        },
        {
          id: 2,
          type: 'enrollment',
          title: 'New Enrollments',
          message: '25 new student enrollments pending approval',
          time: '2 hours ago',
          read: false
        },
        {
          id: 3,
          type: 'fee',
          title: 'Fee Collection Report',
          message: '85% fee collection completed for this term',
          time: '5 hours ago',
          read: true
        },
        {
          id: 4,
          type: 'alert',
          title: 'Server Maintenance',
          message: 'Scheduled maintenance this weekend',
          time: '1 day ago',
          read: false
        }
      ]
    }
    
    setNotifications(mockNotifications)
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'grade': return '📊'
      case 'fee': return '💰'
      case 'attendance': return '📅'
      case 'assignment': return '📝'
      case 'meeting': return '🤝'
      case 'system': return '⚙️'
      case 'enrollment': return '👥'
      case 'alert': return '⚠️'
      default: return '📢'
    }
  }

  return (
    <div className="notification-system">
      <button 
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="close-btn"
              onClick={() => setShowNotifications(false)}
            >
              ×
            </button>
          </div>
          
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  {!notification.read && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationSystem