import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Icon from '../components/Icons'
import { useToast } from '../components/Toast'
import { getUsers, resetTransferCount } from '../lib/db'
import { displayName, initials } from '../lib/format'

const LIMIT = 5

export default function ResetTransfers() {
  const { push } = useToast()
  const [query, setQuery] = useState('')

  const members = getUsers().filter((u) => u.role !== 'admin')
  const filtered = members.filter((u) => {
    const q = query.trim().toLowerCase()
    return !q || displayName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })
  const usedTotal = members.reduce((s, u) => s + (u.transfersUsed || 0), 0)

  const resetOne = (m) => {
    resetTransferCount(m.uid)
    push(`${displayName(m)}'s transfer counter was reset.`, 'success')
  }

  const resetAll = () => {
    if (!members.length) return
    if (!window.confirm('Reset the transfer counter for every member?')) return
    members.forEach((m) => resetTransferCount(m.uid))
    push('All transfer counters were reset.', 'success')
  }

  return (
    <div className="dash">
      <AppHeader />
      <div className="dash-banner admin-banner">
        <div className="container">
          <Icon name="shield" size={15} />
          Administrator utility — resets the monthly transfer allowance.
        </div>
      </div>

      <main className="container dash-container">
        <div className="dash-head">
          <div>
            <span className="eyebrow">Administration</span>
            <h1>Transfer allowances</h1>
            <p className="muted">
              Each member can make {LIMIT} transfers per review cycle. Reset a member
              to let them transfer again.
            </p>
          </div>
          <div className="dash-head-actions">
            <Link to="/admin" className="btn btn-outline">
              <Icon name="arrow" size={16} /> Back to console
            </Link>
            <button className="btn btn-primary" onClick={resetAll}>
              Reset all
            </button>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="icon-tile"><Icon name="users" size={18} /></span>
            <div><span>Members tracked</span><strong>{members.length}</strong></div>
          </div>
          <div className="stat-card">
            <span className="icon-tile amber"><Icon name="transfer" size={18} /></span>
            <div><span>Transfers used</span><strong>{usedTotal}</strong></div>
          </div>
          <div className="stat-card">
            <span className="icon-tile green"><Icon name="check" size={18} /></span>
            <div><span>Remaining allowance</span><strong>{Math.max(members.length * LIMIT - usedTotal, 0)}</strong></div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-head admin-panel-head">
            <h2>Allowance by member</h2>
            <label className="search">
              <Icon name="filter" size={16} />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search members" aria-label="Search members" />
            </label>
          </div>

          {filtered.length ? (
            <div className="allowance-list">
              {filtered.map((m) => {
                const used = m.transfersUsed || 0
                const pct = Math.min((used / LIMIT) * 100, 100)
                return (
                  <div className="allowance-row" key={m.uid}>
                    <span className="avatar sm">{initials(displayName(m), m.email)}</span>
                    <div className="allowance-main">
                      <div className="allowance-top">
                        <strong>{displayName(m)}</strong>
                        <span className="muted small">
                          {used} of {LIMIT} used
                          {used >= LIMIT && ' · limit reached'}
                        </span>
                      </div>
                      <div className="progress">
                        <span
                          className={used >= LIMIT ? 'full' : ''}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <small className="muted">{m.email}</small>
                    </div>
                    <button
                      className={`btn btn-sm ${used ? 'btn-outline' : 'btn-ghost'}`}
                      onClick={() => resetOne(m)}
                      disabled={!used}
                    >
                      Reset
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty">
              <span className="icon-tile lg"><Icon name="users" size={22} /></span>
              <strong>No members match</strong>
              <p>Try a different search term.</p>
            </div>
          )}
        </section>

        <div className="alert alert-warn">
          <Icon name="shield" size={16} />
          Resetting an allowance does not restore spent funds — adjust balances
          from the admin console if needed.
        </div>

        <footer className="dash-foot">
          <span>© {new Date().getFullYear()} WSB Digital. All rights reserved.</span>
          <div><Link to="/admin">Admin console</Link><Link to="/">Website</Link></div>
        </footer>
      </main>
    </div>
  )
}
