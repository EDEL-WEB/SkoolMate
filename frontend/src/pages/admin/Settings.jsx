import { useState, useEffect } from 'react'
import { adminAPI } from '../../utils/api'
import '../../styles/settings.css'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      school_name: 'SkoolMate Academy',
      school_address: '123 Education Street, Learning City',
      school_phone: '+1 (555) 123-4567',
      school_email: 'info@skoolmate.edu',
      academic_year: '2024-2025',
      current_term: 'Term 1',
      timezone: 'UTC-5'
    },
    academic: {
      grading_system: 'percentage',
      passing_grade: 50,
      max_grade: 100,
      attendance_required: 75,
      late_submission_penalty: 10,
      exam_duration: 120
    },
    financial: {
      currency: 'USD',
      late_fee_percentage: 5,
      payment_deadline_days: 30,
      discount_early_payment: 2,
      fee_reminder_days: 7
    },
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      grade_notifications: true,
      attendance_alerts: true,
      fee_reminders: true,
      system_maintenance: true
    },
    security: {
      password_min_length: 8,
      password_require_special: true,
      session_timeout: 30,
      max_login_attempts: 5,
      two_factor_auth: false,
      backup_frequency: 'daily'
    }
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings()
      setSettings(prev => ({ ...prev, ...response.data }))
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminAPI.updateSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ]

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>System Settings</h1>
        <p>Configure your school management system</p>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '⏳ Saving...' : saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>School Name</label>
                  <input
                    type="text"
                    value={settings.general.school_name}
                    onChange={(e) => updateSetting('general', 'school_name', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>School Address</label>
                  <textarea
                    value={settings.general.school_address}
                    onChange={(e) => updateSetting('general', 'school_address', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={settings.general.school_phone}
                    onChange={(e) => updateSetting('general', 'school_phone', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={settings.general.school_email}
                    onChange={(e) => updateSetting('general', 'school_email', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    value={settings.general.academic_year}
                    onChange={(e) => updateSetting('general', 'academic_year', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Current Term</label>
                  <select
                    value={settings.general.current_term}
                    onChange={(e) => updateSetting('general', 'current_term', e.target.value)}
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="settings-section">
              <h2>Academic Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Grading System</label>
                  <select
                    value={settings.academic.grading_system}
                    onChange={(e) => updateSetting('academic', 'grading_system', e.target.value)}
                  >
                    <option value="percentage">Percentage (0-100)</option>
                    <option value="gpa">GPA (0-4.0)</option>
                    <option value="letter">Letter Grades (A-F)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Passing Grade</label>
                  <input
                    type="number"
                    value={settings.academic.passing_grade}
                    onChange={(e) => updateSetting('academic', 'passing_grade', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Maximum Grade</label>
                  <input
                    type="number"
                    value={settings.academic.max_grade}
                    onChange={(e) => updateSetting('academic', 'max_grade', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Required Attendance (%)</label>
                  <input
                    type="number"
                    value={settings.academic.attendance_required}
                    onChange={(e) => updateSetting('academic', 'attendance_required', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="settings-section">
              <h2>Financial Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Currency</label>
                  <select
                    value={settings.financial.currency}
                    onChange={(e) => updateSetting('financial', 'currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="KES">KES (KSh)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Late Fee Percentage</label>
                  <input
                    type="number"
                    value={settings.financial.late_fee_percentage}
                    onChange={(e) => updateSetting('financial', 'late_fee_percentage', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Payment Deadline (Days)</label>
                  <input
                    type="number"
                    value={settings.financial.payment_deadline_days}
                    onChange={(e) => updateSetting('financial', 'payment_deadline_days', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="settings-toggles">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="toggle-item">
                    <div className="toggle-info">
                      <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                      <p>Enable {key.replace(/_/g, ' ')} for users</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Minimum Password Length</label>
                  <input
                    type="number"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Session Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label>Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="settings-toggles">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <label>Require Special Characters</label>
                    <p>Passwords must contain special characters</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.password_require_special}
                      onChange={(e) => updateSetting('security', 'password_require_special', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <div className="toggle-info">
                    <label>Two-Factor Authentication</label>
                    <p>Enable 2FA for enhanced security</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.two_factor_auth}
                      onChange={(e) => updateSetting('security', 'two_factor_auth', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings