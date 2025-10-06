import { useState, useEffect } from 'react'
import { adminAPI } from '../../utils/api'

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([])
  const [newDept, setNewDept] = useState({ name: '' })
  const [editingDept, setEditingDept] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await adminAPI.getDepartments()
      setDepartments(response.data)
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAPI.createDepartment(newDept)
      setNewDept({ name: '' })
      fetchDepartments()
      alert('Department created successfully!')
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create department'
      alert(errorMsg)
      console.error('Failed to create department:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (dept) => {
    setEditingDept(dept)
    setNewDept({ name: dept.name })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminAPI.updateDepartment(editingDept.id, newDept)
      setNewDept({ name: '' })
      setEditingDept(null)
      fetchDepartments()
      alert('Department updated successfully!')
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update department')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await adminAPI.deleteDepartment(id)
        fetchDepartments()
        alert('Department deleted successfully!')
      } catch (error) {
        alert('Failed to delete department')
      }
    }
  }

  const handleCancel = () => {
    setEditingDept(null)
    setNewDept({ name: '' })
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Department Management</h1>
      </div>

      <div className="form-section">
        <h3>{editingDept ? 'Edit Department' : 'Add New Department'}</h3>
        <form onSubmit={editingDept ? handleUpdate : handleCreate} className="inline-form">
          <input
            type="text"
            placeholder="Department Name"
            value={newDept.name}
            onChange={(e) => setNewDept({ name: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (editingDept ? 'Updating...' : 'Adding...') : (editingDept ? 'Update Department' : 'Add Department')}
          </button>
          {editingDept && (
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Teachers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.teachers?.length || 0}</td>
                <td>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => handleEdit(dept)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDelete(dept.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DepartmentManagement