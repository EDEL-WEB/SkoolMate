import { useState, useEffect } from 'react'
import { teachersAPI } from '../../utils/api'
import '../../styles/list.css'

const TeacherList = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll()
      setTeachers(response.data)
    } catch (err) {
      setError('Failed to fetch teachers')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (teacher) => {
    alert(`Edit teacher: ${teacher.full_name}`)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teachersAPI.delete(id)
        fetchTeachers()
        alert('Teacher deleted successfully!')
      } catch (error) {
        alert('Failed to delete teacher')
      }
    }
  }

  if (loading) return <div>Loading teachers...</div>
  if (error) return <div className="error-message">{error}</div>

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Teachers</h1>
        <button className="btn btn-primary">Add Teacher</button>
      </div>
      
      {teachers.length === 0 ? (
        <div className="empty-state">
          <p>No teachers found. Add your first teacher to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.full_name}</td>
                  <td>{teacher.user?.email || 'N/A'}</td>
                  <td>{teacher.department?.name || 'Unassigned'}</td>
                  <td>
                    <button 
                      className="btn btn-sm" 
                      onClick={() => handleEdit(teacher)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(teacher.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TeacherList