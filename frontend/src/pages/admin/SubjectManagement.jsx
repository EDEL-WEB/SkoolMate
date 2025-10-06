import { useState, useEffect } from 'react'
import { adminAPI, teachersAPI } from '../../utils/api'

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [departments, setDepartments] = useState([])
  const [newSubject, setNewSubject] = useState({
    name: '',
    teacher_id: '',
    department_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subjectsRes, teachersRes, deptsRes] = await Promise.all([
        adminAPI.getSubjects().catch(() => ({ data: [] })),
        teachersAPI.getAll().catch(() => ({ data: [] })),
        adminAPI.getDepartments().catch(() => ({ data: [] }))
      ])
      console.log('Departments fetched:', deptsRes.data)
      setSubjects(subjectsRes.data || [])
      setTeachers(teachersRes.data || [])
      setDepartments(deptsRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createSubject(newSubject)
      setNewSubject({ name: '', teacher_id: '', department_id: '' })
      fetchData()
      alert('Subject created successfully!')
    } catch (error) {
      alert('Failed to create subject')
    }
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Subject Management</h1>
      </div>

      <div className="form-section">
        <h3>Create New Subject</h3>
        <p>Teachers: {teachers.length}, Departments: {departments.length}</p>
        <form onSubmit={handleCreate} className="inline-form">
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject.name}
            onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
            required
          />
          
          <select
            value={newSubject.teacher_id}
            onChange={(e) => setNewSubject({...newSubject, teacher_id: e.target.value})}
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
          
          <select
            value={newSubject.department_id}
            onChange={(e) => setNewSubject({...newSubject, department_id: e.target.value})}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          
          <button type="submit" className="btn btn-primary">Create Subject</button>
        </form>
      </div>

      <div className="table-container">
        <h3>Existing Subjects</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Teacher</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td>{subject.name}</td>
                <td>{subject.teacher?.full_name || 'Unassigned'}</td>
                <td>{subject.department?.name || 'Unassigned'}</td>
                <td>
                  <button className="btn btn-sm">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SubjectManagement