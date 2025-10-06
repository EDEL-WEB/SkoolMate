import { useState, useEffect } from 'react'
import { adminAPI } from '../../utils/api'

const AllResults = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await adminAPI.getAllResults()
      setResults(response.data)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading results...</div>

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>All Student Results</h1>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Exam</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td>{result.student?.full_name}</td>
                <td>{result.subject?.name}</td>
                <td>{result.exam_name}</td>
                <td>{result.score}/{result.max_score}</td>
                <td>{((result.score / result.max_score) * 100).toFixed(1)}%</td>
                <td>{result.score >= 80 ? 'A' : result.score >= 70 ? 'B' : result.score >= 60 ? 'C' : 'D'}</td>
                <td>{result.subject?.teacher?.full_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AllResults