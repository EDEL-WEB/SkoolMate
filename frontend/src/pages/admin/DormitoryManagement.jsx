import { useState, useEffect } from 'react'
import { adminAPI, studentsAPI } from '../../utils/api'

const DormitoryManagement = () => {
  const [students, setStudents] = useState([])
  const [dorms, setDorms] = useState([])
  const [assignments, setAssignments] = useState([])
  const [newDorm, setNewDorm] = useState({ name: '', capacity: '' })
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedDorm, setSelectedDorm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, dormsRes, assignmentsRes] = await Promise.all([
        studentsAPI.getAll(),
        adminAPI.getDorms(),
        adminAPI.getDormAssignments()
      ])
      setStudents(studentsRes.data)
      setDorms(dormsRes.data)
      setAssignments(assignmentsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleCreateDorm = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.createDorm(newDorm)
      setNewDorm({ name: '', capacity: '' })
      fetchData()
      alert('Dormitory created successfully!')
    } catch (error) {
      alert('Failed to create dormitory')
    }
  }

  const handleAssignStudent = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.assignStudentToDorm({
        student_id: selectedStudent,
        dorm_id: selectedDorm
      })
      setSelectedStudent('')
      setSelectedDorm('')
      fetchData()
      alert('Student assigned to dormitory!')
    } catch (error) {
      alert('Failed to assign student')
    }
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>Dormitory Management</h1>
      </div>

      <div className="form-section">
        <h3>Create New Dormitory</h3>
        <form onSubmit={handleCreateDorm} className="inline-form">
          <input
            type="text"
            placeholder="Dormitory Name"
            value={newDorm.name}
            onChange={(e) => setNewDorm({...newDorm, name: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Capacity"
            value={newDorm.capacity}
            onChange={(e) => setNewDorm({...newDorm, capacity: e.target.value})}
            required
          />
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </div>

      <div className="form-section">
        <h3>Assign Student to Dormitory</h3>
        <form onSubmit={handleAssignStudent} className="inline-form">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name}
              </option>
            ))}
          </select>
          <select
            value={selectedDorm}
            onChange={(e) => setSelectedDorm(e.target.value)}
            required
          >
            <option value="">Select Dormitory</option>
            {dorms.map((dorm) => (
              <option key={dorm.id} value={dorm.id}>
                {dorm.name} ({dorm.current_occupants}/{dorm.capacity})
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Assign</button>
        </form>
      </div>

      <div className="table-container">
        <h3>Current Assignments</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Dormitory</th>
              <th>Assigned Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td>{assignment.student?.full_name}</td>
                <td>{assignment.dorm?.name}</td>
                <td>{new Date(assignment.assigned_on).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-danger">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DormitoryManagement