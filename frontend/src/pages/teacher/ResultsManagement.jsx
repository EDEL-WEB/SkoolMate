import { useState, useEffect } from 'react'
import { teacherAPI } from '../../utils/api'
import '../../styles/teacher-pages.css'

const ResultsManagement = () => {
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [newResult, setNewResult] = useState({
    student_id: '',
    exam_name: '',
    score: '',
    max_score: 100
  })
  const [editingResult, setEditingResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectData()
    }
  }, [selectedSubject])

  const fetchSubjects = async () => {
    try {
      const response = await teacherAPI.getMySubjects()
      setSubjects(response.data)
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchSubjectData = async () => {
    setLoading(true)
    try {
      console.log('Fetching data for subject:', selectedSubject)
      const [studentsRes, resultsRes] = await Promise.all([
        teacherAPI.getSubjectStudents(selectedSubject),
        teacherAPI.getSubjectResults(selectedSubject)
      ])
      console.log('Students:', studentsRes.data)
      console.log('Results:', resultsRes.data)
      setStudents(studentsRes.data)
      setResults(resultsRes.data)
    } catch (error) {
      console.error('Failed to fetch subject data:', error)
      alert('Failed to fetch subject data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddResult = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('Adding result:', { ...newResult, subject_id: selectedSubject })
      await teacherAPI.addResult({
        ...newResult,
        subject_id: selectedSubject
      })
      setNewResult({
        student_id: '',
        exam_name: '',
        score: '',
        max_score: 100
      })
      fetchSubjectData()
      alert('Result added successfully!')
    } catch (error) {
      console.error('Add result error:', error)
      alert('Failed to add result: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (result) => {
    setEditingResult(result)
    setNewResult({
      student_id: result.student_id,
      exam_name: result.exam?.name || result.exam_name || '',
      score: result.score,
      max_score: 100
    })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await teacherAPI.updateResult(editingResult.id, {
        ...newResult,
        subject_id: selectedSubject
      })
      setNewResult({
        student_id: '',
        exam_name: '',
        score: '',
        max_score: 100
      })
      setEditingResult(null)
      fetchSubjectData()
      alert('Result updated successfully!')
    } catch (error) {
      alert('Failed to update result')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (resultId) => {
    if (confirm('Are you sure you want to delete this result?')) {
      try {
        await teacherAPI.deleteResult(resultId)
        fetchSubjectData()
        alert('Result deleted successfully!')
      } catch (error) {
        alert('Failed to delete result')
      }
    }
  }

  const handleCancel = () => {
    setEditingResult(null)
    setNewResult({
      student_id: '',
      exam_name: '',
      score: '',
      max_score: 100
    })
  }

  return (
    <div className="teacher-page fade-in">
      <div className="teacher-header">
        <h1>📊 Results Management</h1>
        <div className="subtitle">Record and manage student exam results</div>
      </div>

      <div className="teacher-card slide-up">
        <h3>Select Subject</h3>
        <select
          className="form-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="teacher-loading">
          <div className="teacher-spinner"></div>
          <p>Loading results data...</p>
        </div>
      )}
      
      {selectedSubject && !loading && students.length === 0 && (
        <div className="no-students-message">
          <p>No students enrolled in this subject.</p>
        </div>
      )}
      
      {selectedSubject && students.length > 0 && (
        <>
          <div className="teacher-card">
            <h3>{editingResult ? '✏️ Edit Result' : '➕ Add New Result'}</h3>
            <form onSubmit={editingResult ? handleUpdate : handleAddResult} className="teacher-form">
              <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select
                  className="form-select"
                  value={newResult.student_id}
                  onChange={(e) => setNewResult({...newResult, student_id: e.target.value})}
                  required
                >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Exam Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter exam name"
                  value={newResult.exam_name}
                  onChange={(e) => setNewResult({...newResult, exam_name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Score</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Student score"
                  value={newResult.score}
                  onChange={(e) => setNewResult({...newResult, score: e.target.value})}
                  max={newResult.max_score}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Max Score</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Maximum possible score"
                  value={newResult.max_score}
                  onChange={(e) => setNewResult({...newResult, max_score: e.target.value})}
                  required
                />
              </div>
              </div>
              
              <div className="form-row">
                <button type="submit" className="teacher-btn primary" disabled={loading}>
                  <span>{editingResult ? '✏️' : '➕'}</span>
                  {loading ? (editingResult ? 'Updating...' : 'Adding...') : (editingResult ? 'Update Result' : 'Add Result')}
                </button>
                
                {editingResult && (
                  <button type="button" className="teacher-btn warning" onClick={handleCancel}>
                    <span>❌</span>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="teacher-card">
            <h3>📈 Existing Results ({results.length})</h3>
            {results.length > 0 ? (
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.student?.full_name || 'Unknown Student'}</td>
                    <td>{result.exam?.name || result.exam_name || 'Exam'}</td>
                    <td>{result.score}/100</td>
                    <td>{result.score}%</td>
                    <td>
                      <span className={`status-badge ${result.score >= 80 ? 'excellent' : result.score >= 70 ? 'good' : result.score >= 60 ? 'average' : 'poor'}`}>
                        {result.score >= 80 ? 'A' : result.score >= 70 ? 'B' : result.score >= 60 ? 'C' : result.score >= 50 ? 'D' : 'F'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="teacher-btn primary" 
                        onClick={() => handleEdit(result)}
                      >
                        <span>✏️</span>
                        Edit
                      </button>
                      <button 
                        className="teacher-btn danger" 
                        onClick={() => handleDelete(result.id)}
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
              <div className="no-results-message">
                <p>No results recorded for this subject yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ResultsManagement