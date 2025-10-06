import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const [teacherStats, setTeacherStats] = useState(null)
  const [teacherSubjects, setTeacherSubjects] = useState([])

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchTeacherData()
    }
  }, [user])

  const fetchTeacherData = async () => {
    try {
      const [statsResponse, subjectsResponse] = await Promise.all([
        api.get('/teacher/dashboard'),
        api.get('/teacher/subjects')
      ])
      setTeacherStats(statsResponse.data)
      setTeacherSubjects(subjectsResponse.data.subjects || [])
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    }
  }

  const getMenuSections = () => {
    const baseSections = [
      {
        key: 'main',
        title: 'Main',
        items: [{ path: '/', label: 'Dashboard', icon: '📊', badge: null }]
      }
    ]

    if (user?.role === 'admin') {
      return [
        ...baseSections,
        {
          key: 'academic',
          title: 'Academic Management',
          items: [
            { path: '/departments', label: 'Departments', icon: '🏢', badge: null },
            { path: '/subjects', label: 'Subjects', icon: '📚', badge: null },
            { path: '/teachers', label: 'Teachers', icon: '👨🏫', badge: null },
            { path: '/students', label: 'Students', icon: '👨🎓', badge: null }
          ]
        },
        {
          key: 'operations',
          title: 'Operations',
          items: [
            { path: '/attendance', label: 'Attendance', icon: '📅', badge: null },
            { path: '/fees', label: 'Fee Management', icon: '💰', badge: 'New' },
            { path: '/reports', label: 'Reports', icon: '📊', badge: null },
            { path: '/analytics', label: 'Analytics', icon: '📈', badge: null }
          ]
        },
        {
          key: 'system',
          title: 'System',
          items: [
            { path: '/users', label: 'User Management', icon: '👥', badge: null },
            { path: '/settings', label: 'Settings', icon: '⚙️', badge: null }
          ]
        }
      ]
    } else if (user?.role === 'teacher') {
      const sections = [
        ...baseSections,
        {
          key: 'quick-actions',
          title: '⚡ Quick Actions',
          items: [
            { path: '/teacher/attendance', label: 'Mark Attendance', icon: '✅', badge: null, priority: true, color: '#10b981' },
            { path: '/teacher/results', label: 'Enter Results', icon: '📊', badge: null, priority: true, color: '#3b82f6' },
            { path: '/teacher/enrollment', label: 'Manage Students', icon: '👥', badge: null, color: '#8b5cf6' }
          ]
        },
        {
          key: 'teaching',
          title: '🎓 Teaching Hub',
          items: [
            { path: '/teacher/analytics', label: 'Class Analytics', icon: '📈', badge: null, color: '#f59e0b' },
            { path: '/teacher/communication', label: 'Messages', icon: '💬', badge: teacherStats?.unread_messages > 0 ? teacherStats.unread_messages.toString() : null, color: '#ef4444' },
            { path: '/teacher/schedule', label: 'My Schedule', icon: '📅', badge: null, color: '#06b6d4' },
            { path: '/teacher/resources', label: 'Resources', icon: '📚', badge: 'New', color: '#84cc16' }
          ]
        }
      ]

      // Add subjects section if teacher has subjects
      if (teacherSubjects.length > 0) {
        sections.push({
          key: 'subjects',
          title: '📚 My Subjects',
          items: teacherSubjects.slice(0, 5).map((subject, index) => ({
            path: `/teacher/subject/${subject.id}`,
            label: subject.name,
            icon: ['📖', '📘', '📙', '📗', '📕'][index % 5],
            badge: subject.student_count > 20 ? 'Full' : null,
            subtext: `${subject.student_count || 0} students`,
            color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]
          }))
        })
        
        // Auto-expand subjects section for teachers
        if (!expandedSections.subjects) {
          setExpandedSections(prev => ({ ...prev, subjects: true, 'quick-actions': true }))
        }
      }

      return sections
    } else {
      return [
        ...baseSections,
        {
          key: 'student',
          title: 'My Learning',
          items: [
            { path: '/student/reports', label: 'My Reports', icon: '📄', badge: null },
            { path: '/student/attendance', label: 'My Attendance', icon: '📅', badge: null },
            { path: '/student/fees', label: 'Fee Status', icon: '💳', badge: null },
            { path: '/student/timetable', label: 'Timetable', icon: '🗓️', badge: null }
          ]
        }
      ]
    }
  }

  const menuSections = getMenuSections()

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">🎓</div>
          {!isCollapsed && (
            <div className="logo-text">
              <h3>SkoolMate</h3>
              <span>Education Platform</span>
            </div>
          )}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Profile Section */}
      <div className="user-profile">
        <div className="user-avatar">
          {user?.role === 'admin' ? '👑' : user?.role === 'teacher' ? '👨🏫' : '👤'}
        </div>
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{user?.role?.toUpperCase()}</div>
            {user?.role === 'teacher' && teacherStats && (
              <div className="teacher-quick-stats">
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <span className="stat-text">{teacherStats.total_students} Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-text">{teacherSubjects.length} Subjects</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuSections.map((section) => (
          <div key={section.key} className="nav-section">
            {!isCollapsed && (
              <div 
                className="section-header"
                onClick={() => toggleSection(section.key)}
              >
                <span className="section-title">{section.title}</span>
                <span className={`section-toggle ${expandedSections[section.key] ? 'expanded' : ''}`}>
                  ▼
                </span>
              </div>
            )}
            <div className={`section-items ${!isCollapsed && !expandedSections[section.key] && section.key !== 'main' && section.key !== 'quick-actions' ? 'collapsed' : ''}`} data-section={section.key}>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''} ${item.priority ? 'priority' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <div className="link-content">
                        <span className="sidebar-label">{item.label}</span>
                        {item.subtext && (
                          <span className="sidebar-subtext">{item.subtext}</span>
                        )}
                      </div>
                      {item.badge && (
                        <span className={`sidebar-badge ${item.badge.toLowerCase() === 'new' ? 'new' : item.badge.toLowerCase() === 'beta' ? 'beta' : 'count'}`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button 
          className="logout-btn"
          onClick={logout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar