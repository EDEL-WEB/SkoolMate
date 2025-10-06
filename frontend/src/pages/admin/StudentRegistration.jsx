import { useState, useEffect } from 'react'
import { adminAPI, authAPI } from '../../utils/api'

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    gender: '',
    date_of_birth: '',
    parent_contact: '',
    class_name: '',
    stream: ''
  })
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    try {
      const response = await adminAPI.getClassrooms()
      setClassrooms(response.data)
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
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
        role: 'student'
      })

      // Create student profile
      await adminAPI.createStudent({
        user_id: userResponse.data.user.id,
        full_name: formData.full_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        parent_contact: formData.parent_contact,
        class_name: formData.class_name,
        stream: formData.stream
      })

      setMessage(`Student registered successfully! Login credentials: ${formData.email} / ${formData.password}`)
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        gender: '',
        date_of_birth: '',
        parent_contact: '',
        class_name: '',
        stream: ''
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
      <h2>Register New Student</h2>
      {message && (
        <div className={message.includes('success') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
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
        </div>
        
        <div className="form-row">
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
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Parent Contact</label>
            <input
              type="tel"
              name="parent_contact"
              value={formData.parent_contact}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Class</label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              placeholder="e.g., Grade 1, Form 1, Class 8"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Stream</label>
            <input
              type="text"
              name="stream"
              value={formData.stream}
              onChange={handleChange}
              placeholder="e.g., A, B, East, West"
              required
            />
          </div>
          
          <div className="form-group">
            {/* Empty div for layout */}
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registering...' : 'Register Student'}
        </button>
      </form>
    </div>
  )
}

export default StudentRegistration