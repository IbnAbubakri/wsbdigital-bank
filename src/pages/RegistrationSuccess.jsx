import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/Icons'

export default function RegistrationSuccess() {
  const { user } = useAuth()
  const reference = user?.uid ? user.uid.slice(0, 8).toUpperCase() : 'WSB-00000'

  return (
    <main className="auth-shell">
      <div className="success-card">
        <span className="success-icon">
          <Icon name="check" size={30} />
        </span>
        <span className="eyebrow">Application received</span>
        <h1>You are almost in</h1>
        <p>
          Your application was created and is now waiting for review. We will
          email you as soon as your account is ready.
        </p>

        <div className="reference">
          <span>Application reference</span>
          <strong>{reference}</strong>
        </div>

        <ol className="next-steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <strong>Application submitted</strong>
              <p>Your application details have been saved.</p>
            </div>
            <span className="badge badge-success">Done</span>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <strong>Member services review</strong>
              <p>Our team is reviewing your information.</p>
            </div>
            <span className="badge badge-warn">Pending</span>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <strong>Access your dashboard</strong>
              <p>Once approved, balances, transfers, and cards unlock.</p>
            </div>
            <span className="badge badge-neutral">Locked</span>
          </li>
        </ol>

        <div className="alert alert-info">
          <Icon name="clock" size={17} />
          Most applications are reviewed within one business day. Need help?
          Contact member services at <strong>support@wsbdigital.com</strong>.
        </div>

        <div className="inline-actions">
          <Link to="/pending-approval" className="btn btn-primary">
            View application status
          </Link>
          <Link to="/" className="btn btn-outline">
            Return home
          </Link>
        </div>
      </div>
    </main>
  )
}
