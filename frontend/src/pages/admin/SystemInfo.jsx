import { useState, useEffect } from 'react'
import { adminAPI } from '../../utils/api'
import '../../styles/system-info.css'

const SystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)

  useEffect(() => {
    fetchSystemInfo()
  }, [])

  const fetchSystemInfo = async () => {
    try {
      const response = await adminAPI.getSystemInfo()
      setSystemInfo(response.data)
    } catch (error) {
      console.error('Failed to fetch system info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    setBackupLoading(true)
    try {
      const response = await adminAPI.createBackup()
      alert(`Backup created successfully: ${response.data.backup.backup_id}`)
      fetchSystemInfo() // Refresh system info
    } catch (error) {
      alert('Failed to create backup')
    } finally {
      setBackupLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading system information...</div>

  return (
    <div className="system-info">
      <div className="system-header">
        <h1>System Information</h1>
        <button 
          className="backup-btn"
          onClick={handleBackup}
          disabled={backupLoading}
        >
          {backupLoading ? '⏳ Creating...' : '💾 Create Backup'}
        </button>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>📊 System Statistics</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span>Total Users</span>
              <strong>{systemInfo?.statistics?.total_users || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Students</span>
              <strong>{systemInfo?.statistics?.total_students || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Teachers</span>
              <strong>{systemInfo?.statistics?.total_teachers || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Subjects</span>
              <strong>{systemInfo?.statistics?.total_subjects || 0}</strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>💾 Database Information</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span>Database Type</span>
              <strong>{systemInfo?.database?.type || 'N/A'}</strong>
            </div>
            <div className="stat-item">
              <span>Database Size</span>
              <strong>{systemInfo?.database?.size || 'N/A'}</strong>
            </div>
            <div className="stat-item">
              <span>Last Backup</span>
              <strong>{systemInfo?.database?.last_backup || 'Never'}</strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>🖥️ Server Status</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span>Uptime</span>
              <strong>{systemInfo?.server?.uptime || 'N/A'}</strong>
            </div>
            <div className="stat-item">
              <span>Memory Usage</span>
              <strong>{systemInfo?.server?.memory_usage || 'N/A'}</strong>
            </div>
            <div className="stat-item">
              <span>Disk Space</span>
              <strong>{systemInfo?.server?.disk_space || 'N/A'}</strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>ℹ️ Application Info</h3>
          <div className="stats-list">
            <div className="stat-item">
              <span>Version</span>
              <strong>{systemInfo?.version || '1.0.0'}</strong>
            </div>
            <div className="stat-item">
              <span>Environment</span>
              <strong>Production</strong>
            </div>
            <div className="stat-item">
              <span>Last Updated</span>
              <strong>2024-01-15</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemInfo