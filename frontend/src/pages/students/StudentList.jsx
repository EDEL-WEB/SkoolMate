import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentsAPI } from '../../utils/api'
import '../../styles/list.css'

const StudentList = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll()
      setStudents(response.data)
    } catch (err) {
      setError('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student) => {
    // Navigate to edit page or open modal
    alert(`Edit student: ${student.full_name}`)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id)
        fetchStudents()
        alert('Student deleted successfully!')
      } catch (error) {
        alert('Failed to delete student')
      }
    }
  }

  if (loading) return <div>Loading students...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Students</h1>
        {user?.role === 'admin' && (
          <button className="btn btn-primary">Add Student</button>
        )}
      </div>
      
      {students.length === 0 ? (
        <div className="empty-state">
          <p>No students found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.full_name}</td>
                  <td>{student.user?.email || 'N/A'}</td>
                  <td>{student.classroom?.name || 'Unassigned'}</td>
                  {user?.role === 'admin' && (
                    <td>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StudentList