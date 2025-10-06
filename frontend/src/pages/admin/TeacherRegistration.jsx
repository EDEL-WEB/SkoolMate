import { useState, useEffect } from 'react'
import { adminAPI, authAPI } from '../../utils/api'

const TeacherRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    department_id: '',
    subject_name: ''
  })
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDepartments()
  }, [])

  // Refresh departments when component becomes visible
  useEffect(() => {
    const handleFocus = () => fetchDepartments()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await adminAPI.getDepartments()
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Create user account
      const userResponse = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: 'teacher'
      })

      // Create teacher profile
      const teacherResponse = await adminAPI.createTeacher({
        user_id: userResponse.data.user.id,
        full_name: formData.full_name,
        department_id: formData.department_id
      })

      // Create subject for teacher
      if (formData.subject_name) {
        await adminAPI.createSubject({
          name: formData.subject_name,
          teacher_id: teacherResponse.data.id,
          department_id: formData.department_id
        })
      }

      setMessage(`Teacher registered successfully! Login credentials: ${formData.email} / ${formData.password}`)
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        department_id: '',
        subject_name: ''
      })
    } catch (error) {
      setMessage(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="form-container">
      <h2>Register New Teacher</h2>
      {message && (
        <div className={message.includes('success') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Subject Name</label>
          <input
            type="text"
            name="subject_name"
            value={formData.subject_name}
            onChange={handleChange}
            placeholder="e.g., Mathematics, English, Science"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Department</label>
          <div className="select-with-refresh">
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={fetchDepartments}
              className="btn btn-sm"
              title="Refresh departments"
            >
              🔄
            </button>
          </div>
          {departments.length === 0 && (
            <small style={{color: '#dc3545'}}>No departments found. Add departments first.</small>
          )}
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registering...' : 'Register Teacher'}
        </button>
      </form>
    </div>
  )
}

export default TeacherRegistration