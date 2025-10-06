import { useState, useEffect } from 'react'
import { adminAPI } from '../../utils/api'
import '../../styles/admin-dashboard.css'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, analyticsRes, feesRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics(),
        adminAPI.getFeeOverview()
      ])
      
      setDashboardData(dashboardRes.data)
      setAnalytics(analyticsRes.data)
      
      // Mock recent activity - in real app, fetch from API
      setRecentActivity([
        { id: 1, type: 'enrollment', message: 'New student enrolled in Mathematics', time: '2 hours ago', icon: '👤' },
        { id: 2, type: 'payment', message: 'Fee payment received from John Doe', time: '3 hours ago', icon: '💰' },
        { id: 3, type: 'result', message: 'Results published for Mid Term Exam', time: '5 hours ago', icon: '📊' },
        { id: 4, type: 'attendance', message: 'Attendance marked for Class 10A', time: '1 day ago', icon: '📅' }
      ])
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading admin dashboard...</div>

  const stats = dashboardData?.statistics || {}

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Control Center</h1>
          <p>Complete school management overview</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            📊 Generate Report
          </button>
          <button className="btn btn-secondary">
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card students">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Students</h3>
            <div className="metric-number">{stats.total_students || 0}</div>
            <div className="metric-change positive">+12 this month</div>
          </div>
        </div>

        <div className="metric-card teachers">
          <div className="metric-icon">👨‍🏫</div>
          <div className="metric-content">
            <h3>Active Teachers</h3>
            <div className="metric-number">{stats.total_teachers || 0}</div>
            <div className="metric-change positive">+2 this month</div>
          </div>
        </div>

        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Revenue</h3>
            <div className="metric-number">$45,280</div>
            <div className="metric-change positive">+8.2% vs last month</div>
          </div>
        </div>

        <div className="metric-card attendance">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Attendance Rate</h3>
            <div className="metric-number">{analytics?.attendance_rate?.toFixed(1) || 0}%</div>
            <div className="metric-change negative">-2.1% vs last week</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          ⚙️ Management
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📋 Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="content-grid">
              <div className="chart-section">
                <h2>Performance Overview</h2>
                <div className="chart-placeholder">
                  <div className="chart-bars">
                    <div className="bar" style={{height: '60%'}}><span>Jan</span></div>
                    <div className="bar" style={{height: '75%'}}><span>Feb</span></div>
                    <div className="bar" style={{height: '45%'}}><span>Mar</span></div>
                    <div className="bar" style={{height: '85%'}}><span>Apr</span></div>
                    <div className="bar" style={{height: '70%'}}><span>May</span></div>
                    <div className="bar" style={{height: '90%'}}><span>Jun</span></div>
                  </div>
                  <p>Student Performance Trends</p>
                </div>
              </div>

              <div className="activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">{activity.icon}</div>
                      <div className="activity-content">
                        <p>{activity.message}</p>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="stat-item">
                <h4>Subjects</h4>
                <div className="stat-value">{stats.total_subjects || 0}</div>
              </div>
              <div className="stat-item">
                <h4>Departments</h4>
                <div className="stat-value">{stats.total_departments || 0}</div>
              </div>
              <div className="stat-item">
                <h4>Pending Fees</h4>
                <div className="stat-value">{stats.unpaid_fees || 0}</div>
              </div>
              <div className="stat-item">
                <h4>Appointments</h4>
                <div className="stat-value">{stats.pending_appointments || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Grade Distribution</h3>
                <div className="grade-chart">
                  <div className="grade-bar grade-a" style={{width: '25%'}}>A (25%)</div>
                  <div className="grade-bar grade-b" style={{width: '35%'}}>B (35%)</div>
                  <div className="grade-bar grade-c" style={{width: '25%'}}>C (25%)</div>
                  <div className="grade-bar grade-d" style={{width: '15%'}}>D (15%)</div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Department Performance</h3>
                <div className="department-list">
                  <div className="dept-item">
                    <span>Mathematics</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: '85%'}}></div>
                    </div>
                    <span>85%</span>
                  </div>
                  <div className="dept-item">
                    <span>Science</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: '78%'}}></div>
                    </div>
                    <span>78%</span>
                  </div>
                  <div className="dept-item">
                    <span>English</span>
                    <div className="progress-bar">
                      <div className="progress" style={{width: '92%'}}></div>
                    </div>
                    <span>92%</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Financial Overview</h3>
                <div className="financial-stats">
                  <div className="fin-item">
                    <span>Total Revenue</span>
                    <strong>$125,450</strong>
                  </div>
                  <div className="fin-item">
                    <span>Outstanding Fees</span>
                    <strong>$23,120</strong>
                  </div>
                  <div className="fin-item">
                    <span>Collection Rate</span>
                    <strong>84.5%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="management-content">
            <div className="management-grid">
              <div className="management-card">
                <h3>🏫 School Management</h3>
                <div className="management-actions">
                  <button className="action-btn" onClick={() => window.location.href = '/students'}>
                    👥 Manage Students
                  </button>
                  <button className="action-btn" onClick={() => window.location.href = '/teachers'}>
                    👨‍🏫 Manage Teachers
                  </button>
                  <button className="action-btn" onClick={() => window.location.href = '/subjects'}>
                    📚 Manage Subjects
                  </button>
                </div>
              </div>

              <div className="management-card">
                <h3>💰 Financial Management</h3>
                <div className="management-actions">
                  <button className="action-btn">
                    💳 Fee Collection
                  </button>
                  <button className="action-btn">
                    📊 Financial Reports
                  </button>
                  <button className="action-btn">
                    💰 Payment Tracking
                  </button>
                </div>
              </div>

              <div className="management-card">
                <h3>📋 Academic Management</h3>
                <div className="management-actions">
                  <button className="action-btn">
                    📝 Exam Management
                  </button>
                  <button className="action-btn">
                    📊 Results Processing
                  </button>
                  <button className="action-btn">
                    📅 Academic Calendar
                  </button>
                </div>
              </div>

              <div className="management-card">
                <h3>⚙️ System Management</h3>
                <div className="management-actions">
                  <button className="action-btn">
                    👤 User Management
                  </button>
                  <button className="action-btn">
                    🔧 System Settings
                  </button>
                  <button className="action-btn">
                    📊 Data Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-content">
            <div className="reports-grid">
              <div className="report-card">
                <h3>📊 Academic Reports</h3>
                <p>Generate comprehensive academic performance reports</p>
                <button className="btn btn-primary">Generate Report</button>
              </div>
              
              <div className="report-card">
                <h3>💰 Financial Reports</h3>
                <p>Fee collection and financial analysis reports</p>
                <button className="btn btn-primary">Generate Report</button>
              </div>
              
              <div className="report-card">
                <h3>📅 Attendance Reports</h3>
                <p>Student and teacher attendance analytics</p>
                <button className="btn btn-primary">Generate Report</button>
              </div>
              
              <div className="report-card">
                <h3>📈 Performance Reports</h3>
                <p>Overall school performance and trends</p>
                <button className="btn btn-primary">Generate Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard