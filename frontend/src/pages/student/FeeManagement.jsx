import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'
import './FeeManagement.css'

const FeeManagement = () => {
  const [feeData, setFeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchFeeData()
  }, [])

  const fetchFeeData = async () => {
    try {
      const response = await studentAPI.getFees()
      setFeeData(response.data)
    } catch (error) {
      console.error('Failed to fetch fee data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    
    try {
      await studentAPI.makePayment({
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod
      })
      
      alert('Payment processed successfully!')
      setPaymentAmount('')
      fetchFeeData()
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="fee-loading">
        <div className="fee-spinner"></div>
        <p>Loading fee information...</p>
      </div>
    )
  }

  return (
    <div className="fee-management">
      <div className="fee-header">
        <h1>💰 Fee Management</h1>
        <p>Manage your school fees and payment history</p>
      </div>

      {feeData && feeData.summary && (
        <>
          <div className="fee-summary">
            <div className="summary-card total">
              <h3>Total Fees</h3>
              <span className="amount">${feeData.summary.total_fees || 0}</span>
            </div>
            <div className="summary-card paid">
              <h3>Amount Paid</h3>
              <span className="amount">${feeData.summary.total_paid || 0}</span>
            </div>
            <div className="summary-card outstanding">
              <h3>Outstanding</h3>
              <span className="amount">${feeData.summary.outstanding || 0}</span>
            </div>
          </div>

          {(feeData.summary.outstanding || 0) > 0 && (
            <div className="payment-section">
              <h2>Make Payment</h2>
              <form onSubmit={handlePayment} className="payment-form">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={feeData.summary.outstanding || 0}
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                  </select>
                </div>
                <button type="submit" disabled={processing || !paymentAmount}>
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </form>
            </div>
          )}

          <div className="fee-breakdown">
            <h2>Fee Breakdown</h2>
            <div className="fee-list">
              {(feeData.fees || []).map((fee) => (
                <div key={fee.id} className="fee-item">
                  <div className="fee-info">
                    <h4>{fee.fee_type}</h4>
                    <p>{fee.description}</p>
                    <span className="due-date">Due: {new Date(fee.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="fee-amount">${fee.amount}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-history">
            <h2>Payment History</h2>
            {(feeData.payments || []).length > 0 ? (
              <div className="payments-list">
                {(feeData.payments || []).map((payment) => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <span className="payment-ref">{payment.reference_number}</span>
                      <span className="payment-date">{new Date(payment.created_at).toLocaleDateString()}</span>
                      <span className="payment-method">{payment.payment_method}</span>
                    </div>
                    <div className="payment-amount">${payment.amount}</div>
                    <div className={`payment-status ${payment.status}`}>
                      {payment.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-payments">No payment history available</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default FeeManagement