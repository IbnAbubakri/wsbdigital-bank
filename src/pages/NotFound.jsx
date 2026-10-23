import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="auth-shell">
      <div className="notfound-card">
        <span className="eyebrow">404</span>
        <h1>This page does not exist</h1>
        <p>The link may be outdated, or the page may have moved.</p>
        <div className="inline-actions">
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <Link to="/dashboard" className="btn btn-outline">Go to dashboard</Link>
        </div>
      </div>
    </main>
  )
}
