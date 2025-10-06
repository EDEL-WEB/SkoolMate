import { useState, useEffect } from 'react'
import { studentsAPI, teacherAPI } from '../../utils/api'
import '../../styles/teacher-pages.css'

const StudentEnrollment = () => {
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-select student when search matches exactly one
  useEffect(() => {
    if (searchTerm && students.length > 0) {
      const matchingStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (matchingStudents.length === 1) {
        setSelectedStudent(matchingStudents[0].id.toString())
      }
    }
  }, [searchTerm, students])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [studentsRes, subjectsRes, enrollmentsRes] = await Promise.all([
        studentsAPI.getAll(), // Get all students
        teacherAPI.getMySubjects(),
        teacherAPI.getEnrollments()
      ])
      console.log('Students fetched:', studentsRes.data)
      console.log('Subjects fetched:', subjectsRes.data)
      console.log('Enrollments fetched:', enrollmentsRes.data)
      setStudents(studentsRes.data || [])
      setSubjects(subjectsRes.data || [])
      setEnrollments(enrollmentsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError(`Failed to fetch data: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (e, subjectId) => {
    e.preventDefault()
    setLoading(true)
    try {
      await teacherAPI.enrollStudent({
        student_id: selectedStudent,
        subject_id: subjectId
      })
      setSelectedStudent('')
      setSearchTerm('')
      fetchData()
      alert('Student enrolled successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to enroll student')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveEnrollment = async (enrollmentId) => {
    if (confirm('Are you sure you want to remove this enrollment?')) {
      try {
        await teacherAPI.removeEnrollment(enrollmentId)
        fetchData()
        alert('Enrollment removed successfully!')
      } catch (error) {
        alert('Failed to remove enrollment')
      }
    }
  }

  if (loading) return <div>Loading enrollment data...</div>

  return (
    <div className="teacher-page fade-in">
      <div className="teacher-header">
        <h1>👥 Student Enrollment</h1>
        <div className="subtitle">Manage student enrollments across your subjects</div>
      </div>

      <div className="teacher-card slide-up">
        <h3>Enroll Students</h3>
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  setSearchTerm(e.target.value.trim())
                }
              }}
              className="search-input"
            />
            <button 
              type="button" 
              onClick={() => setSearchTerm(searchTerm.trim())}
              className="btn btn-primary search-btn"
            >
              Filter
            </button>
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')}
                className="btn btn-secondary clear-btn"
              >
                Clear
              </button>
            )}
          </div>
          <p className="students-info">
            Total students available: {students.length}
            {searchTerm && ` | Searching for: "${searchTerm}"`}
          </p>
          <p className="subjects-info">
            My subjects: {subjects.length}
          </p>
          {error && (
            <div className="error-message" style={{color: 'red', marginTop: '0.5rem'}}>
              {error}
            </div>
          )}
        </div>
        <div className="teacher-stats-grid">
          {subjects.length === 0 ? (
            <div className="no-subjects">
              <p>You don't have any subjects assigned yet.</p>
              <p>Please contact admin to assign subjects to you.</p>
            </div>
          ) : (
            subjects.map((subject, index) => {
            const availableStudents = students.filter(student => 
              !enrollments.some(enrollment => 
                enrollment.student_id === student.id && enrollment.subject_id === subject.id
              )
            )
            
            const filteredStudents = searchTerm 
              ? availableStudents.filter(student =>
                  student.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : availableStudents
            
            return (
              <div key={subject.id} className="teacher-card">
                <h4>📚 {subject.name}</h4>
                <p className="available-count">
                  Available students: {availableStudents.length}
                  {searchTerm && ` | Filtered: ${filteredStudents.length}`}
                </p>
                
                {filteredStudents.length > 0 ? (
                  <form onSubmit={(e) => handleEnroll(e, subject.id)} className="enrollment-form">
                    <select
                      className="form-select"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      required
                    >
                      <option value="">Select Available Student</option>
                      {filteredStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name}
                        </option>
                      ))}
                    </select>
                    
                    <button type="submit" className="teacher-btn primary" disabled={loading || !selectedStudent}>
                      <span>✅</span>
                      {loading ? 'Enrolling...' : `Enroll to ${subject.name}`}
                    </button>
                    
                    {filteredStudents.length === 1 && searchTerm && (
                      <button 
                        type="button" 
                        className="btn btn-success" 
                        onClick={(e) => {
                          e.preventDefault()
                          handleEnroll(e, subject.id)
                        }}
                        disabled={loading}
                      >
                        Quick Enroll {filteredStudents[0].full_name}
                      </button>
                    )}
                  </form>
                ) : (
                  <p className="no-students">
                    {searchTerm 
                      ? `No available students found matching "${searchTerm}"` 
                      : 'All students are already enrolled in this subject.'}
                  </p>
                )}
              </div>
            )
          })
          )}
        </div>
      </div>

      <div className="teacher-card">
        <h3>Current Enrollments</h3>
        {subjects.map((subject) => {
          const subjectEnrollments = enrollments.filter(e => e.subject_id === subject.id)
          return (
            <div key={subject.id} className="subject-enrollments">
              <h4>{subject.name} ({subjectEnrollments.length} students)</h4>
              {subjectEnrollments.length > 0 ? (
                <table className="teacher-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Enrolled Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectEnrollments.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.student?.full_name}</td>
                        <td>{new Date(enrollment.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="teacher-btn danger"
                            onClick={() => handleRemoveEnrollment(enrollment.id)}
                          >
                            <span>🗑️</span>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No students enrolled in this subject.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StudentEnrollment