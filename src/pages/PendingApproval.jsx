import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icons'

export default function PendingApproval() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <div className="notfound-card">
          <span className="eyebrow">Application status</span>
          <h1>No active application</h1>
          <p>Sign in to check the status of your application.</p>
          <div className="inline-actions">
            <Link to="/login" className="btn btn-primary">Sign in</Link>
            <Link to="/signup" className="btn btn-outline">Start an application</Link>
          </div>
        </div>
      </div>
    )
  }

  const approved = user.status === 'active'
  const rejected = user.status === 'rejected'

  return (
    <div className="auth-shell">
      <div className="success-card">
        <span className={`success-icon ${approved ? '' : rejected ? 'danger' : 'pending'}`}>
          <Icon name={approved ? 'check' : rejected ? 'close' : 'clock'} size={28} />
        </span>
        <span className="eyebrow">Application status</span>
        <h1>
          {approved ? 'You are approved' : rejected ? 'Application declined' : 'Under review'}
        </h1>
        <p>
          {approved
            ? 'Your account is active. Everything is unlocked.'
            : rejected
              ? 'This application was declined. Contact member services if you have questions.'
              : 'Your application is waiting for review. This page updates automatically.'}
        </p>

        <div className="status-card">
          <div className="status-row">
            <span>Applicant</span>
            <strong>{user.name}</strong>
          </div>
          <div className="status-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="status-row">
            <span>Status</span>
            <span
              className={`badge ${
                approved ? 'badge-success' : rejected ? 'badge-danger' : 'badge-warn'
              }`}
            >
              {approved ? 'Approved' : rejected ? 'Rejected' : 'Pending review'}
            </span>
          </div>
          <div className="status-row">
            <span>Reference</span>
            <strong className="mono">{user.uid.slice(0, 8).toUpperCase()}</strong>
          </div>
        </div>

        {!approved && !rejected && (
          <div className="alert alert-info">
            <Icon name="clock" size={17} />
            Applications are typically reviewed within one business day. We will
            email you as soon as there is an update.
          </div>
        )}

        <div className="inline-actions">
          {approved ? (
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary">
              Go to {user.role === 'admin' ? 'admin console' : 'dashboard'}
            </Link>
          ) : (
            <button onClick={signOut} className="btn btn-primary">
              Sign out
            </button>
          )}
          <Link to="/" className="btn btn-outline">Return home</Link>
        </div>
      </div>
    </div>
  )
}
