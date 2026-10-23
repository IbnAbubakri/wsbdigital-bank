import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import Logo from '../components/Logo'
import Icon from '../components/Icons'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { push } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    if (user.status === 'pending') navigate('/pending-approval', { replace: true })
    else if (user.role === 'admin') navigate('/admin', { replace: true })
    else navigate(location.state?.from || '/dashboard', { replace: true })
  }, [user, navigate, location.state])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const next = await login(form.email.trim(), form.password)
      push(`Welcome back, ${next.name.split(' ')[0]}.`, 'success')
      if (next.status === 'pending') navigate('/pending-approval')
      else if (next.role === 'admin') navigate('/admin')
      else navigate(location.state?.from || '/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <Link to="/" className="auth-brand">
          <Logo />
        </Link>
        <div className="auth-aside-body">
          <span className="eyebrow light">WSB Digital secure portal</span>
          <h1>Connecting you to what matters most.</h1>
          <p>
            One place for balances, transfers, cards, and statements — designed
            to feel calm, clear, and fast.
          </p>
          <ul className="auth-bullets">
            <li><Icon name="shield" size={18} /> Secure, role-based access</li>
            <li><Icon name="lock" size={18} /> Encrypted session handling</li>
            <li><Icon name="users" size={18} /> Member and administrator portals</li>
          </ul>
        </div>
        <div className="auth-aside-foot">
          <span className="badge badge-success">Secure online banking</span>
          <p>Member support available Mon–Fri, 8am–6pm ET.</p>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-card">
            <h2>Welcome back</h2>
            <p className="muted">Sign in to your online banking account.</p>

            {error && <div className="alert alert-error" role="alert" aria-live="assertive">{error}</div>}

            <form onSubmit={submit} className="form" noValidate>
              <label className="field">
                <span>Email address</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  aria-invalid={Boolean(error)}
                />
              </label>
              <div className="field">
                <span id="login-password-label">Password</span>
                <div className="input-wrap">
                  <input
                    type={show ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    aria-labelledby="login-password-label"
                    aria-invalid={Boolean(error)}
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    <Icon name="eye" size={18} />
                  </button>
                </div>
              </div>

              <div className="form-between">
                <label className="check">
                  <input type="checkbox" defaultChecked /> Remember this device
                </label>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => push('Enter your email address and we will send a secure reset link.', 'info')}
                >
                  Forgot password?
                </button>
              </div>

              <button className="btn btn-primary btn-block" disabled={busy}>
                {busy ? <span className="spinner" /> : 'Continue'}
              </button>
            </form>

            <p className="auth-switch">
              New here? <Link to="/signup">Open an account</Link>
            </p>
          </div>

          <p className="auth-legal">
            © {new Date().getFullYear()} WSB Digital. All rights reserved.
            <br />
            Privacy · Terms · Accessibility
          </p>
        </div>
      </main>
    </div>
  )
}
