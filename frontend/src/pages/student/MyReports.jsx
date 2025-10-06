import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'

const MyReports = () => {
  const [reports, setReports] = useState([])
  const [fees, setFees] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [reportsRes, feesRes, resultsRes] = await Promise.all([
        studentAPI.getMyReports(),
        studentAPI.getMyFees(),
        studentAPI.getMyResults()
      ])
      setReports(reportsRes.data)
      setFees(feesRes.data)
      setResults(resultsRes.data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading reports...</div>

  return (
    <div className="reports-container">
      <h1>My Reports</h1>

      {/* Academic Results */}
      <div className="report-section">
        <h2>Academic Results</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.exam?.subject?.name}</td>
                  <td>{result.exam?.name}</td>
                  <td>{result.score}</td>
                  <td>{result.score >= 80 ? 'A' : result.score >= 70 ? 'B' : result.score >= 60 ? 'C' : result.score >= 50 ? 'D' : 'F'}</td>
                  <td>{new Date(result.exam?.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Statement */}
      <div className="report-section">
        <h2>Fee Statement</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Amount Due</th>
                <th>Amount Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.term}</td>
                  <td>${fee.amount_due}</td>
                  <td>${fee.amount_paid}</td>
                  <td>${fee.amount_due - fee.amount_paid}</td>
                  <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${fee.is_paid ? 'paid' : 'pending'}`}>
                      {fee.is_paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Cards */}
      <div className="report-section">
        <h2>Report Cards</h2>
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <h3>{report.term} {report.year}</h3>
              <p>Generated: {new Date(report.created_at).toLocaleDateString()}</p>
              <button className="btn btn-primary">Download PDF</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyReports