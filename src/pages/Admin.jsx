import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Modal from '../components/Modal'
import Icon from '../components/Icons'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import {
  addAdminTransaction,
  adjustBalance,
  approveUser,
  createUserByAdmin,
  deleteTransaction,
  deleteUserTransactions,
  getTransactions,
  getUsers,
  rejectUser,
  resetTransferCount,
} from '../lib/db'
import {
  currency,
  displayName,
  formatDate,
  formatDateTime,
  groupAccountNumber,
  initials,
  maskAccountNumber,
} from '../lib/format'

function StatusBadge({ status }) {
  const map = {
    active: ['badge-success', 'Active'],
    pending: ['badge-warn', 'Pending'],
    rejected: ['badge-danger', 'Rejected'],
  }
  const [cls, label] = map[status] || ['badge-neutral', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function AccountEdit({ account, onSave }) {
  const [value, setValue] = useState(account.available)
  useEffect(() => setValue(account.available), [account.available])

  return (
    <form
      className="account-edit"
      onSubmit={(e) => {
        e.preventDefault()
        onSave(account.type, value)
      }}
    >
      <div>
        <strong>{account.type}</strong>
        <span className="mono">{groupAccountNumber(account.number)}</span>
      </div>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={`${account.type} available balance`}
      />
      <button className="btn btn-outline btn-sm">Update</button>
    </form>
  )
}

function MemberDetail({ member, onClose, onToast }) {
  const [txForm, setTxForm] = useState({ accountType: 'Checking', type: 'credit', amount: '', description: '' })
  const txs = getTransactions(member.uid)

  useEffect(() => {
    setTxForm({ accountType: member.accounts?.[0]?.type || 'Checking', type: 'credit', amount: '', description: '' })
  }, [member.uid, member.accounts])

  const approve = () => {
    approveUser(member.uid)
    onToast(`${displayName(member)} approved.`, 'success')
  }
  const reject = () => {
    rejectUser(member.uid)
    onToast(`${displayName(member)} rejected.`, 'warn')
  }
  const reset = () => {
    resetTransferCount(member.uid)
    onToast('Transfer counter reset.', 'success')
  }
  const clearTxs = () => {
    if (!window.confirm(`Delete all transactions for ${displayName(member)}?`)) return
    deleteUserTransactions(member.uid)
    onToast('All transactions deleted.', 'success')
  }
  const saveBalance = (type, value) => {
    try {
      adjustBalance(member.uid, type, value)
      onToast(`${type} balance updated.`, 'success')
    } catch (err) {
      onToast(err.message, 'error')
    }
  }
  const addTx = (e) => {
    e.preventDefault()
    try {
      addAdminTransaction({
        userId: member.uid,
        accountType: txForm.accountType,
        type: txForm.type,
        amount: txForm.amount,
        description: txForm.description || 'Admin adjustment',
      })
      onToast('Transaction posted.', 'success')
      setTxForm((f) => ({ ...f, amount: '', description: '' }))
    } catch (err) {
      onToast(err.message, 'error')
    }
  }

  const address = member.personalInfo?.address || {}

  return (
    <>
      <div className="member-detail-head">
        <span className="avatar lg">{initials(displayName(member), member.email)}</span>
        <div>
          <h3>{displayName(member)}</h3>
          <p>{member.email}</p>
          <div className="inline-badges">
            <StatusBadge status={member.status} />
            <span className={`badge ${member.role === 'admin' ? 'badge-blue' : 'badge-neutral'}`}>
              {member.role}
            </span>
            {member.twoFactor && <span className="badge badge-neutral">2FA</span>}
          </div>
        </div>
        <div className="member-detail-balance">
          <span>Total balance</span>
          <strong>{currency((member.accounts || []).reduce((s, a) => s + Number(a.available || 0), 0))}</strong>
        </div>
      </div>

      <div className="detail-grid">
        <div><span>Phone</span><strong>{member.contact?.phone || '—'}</strong></div>
        <div><span>Date of birth</span><strong>{member.personalInfo?.dob || '—'}</strong></div>
        <div><span>Nationality</span><strong>{member.personalInfo?.nationality || '—'}</strong></div>
        <div><span>Marital status</span><strong>{member.personalInfo?.maritalStatus || '—'}</strong></div>
        <div className="span-2">
          <span>Address</span>
          <strong>
            {[address.street, address.city, address.state, address.postalCode, address.country]
              .filter(Boolean)
              .join(', ') || '—'}
          </strong>
        </div>
        <div><span>ID document</span><strong>{member.documents?.idType || '—'} {member.documents?.idNumber || ''}</strong></div>
        <div><span>Member since</span><strong>{formatDate(member.createdAt)}</strong></div>
        <div><span>Transfers used</span><strong>{member.transfersUsed || 0} of 5</strong></div>
        <div><span>Reference</span><strong className="mono">{member.uid.slice(0, 8).toUpperCase()}</strong></div>
      </div>

      <div className="panel panel-inset">
        <div className="panel-head">
          <h3>Accounts</h3>
          <span className="muted small">Edit available balances</span>
        </div>
        <div className="account-edit-list">
          {(member.accounts || []).map((a) => (
            <AccountEdit key={a.id} account={a} onSave={saveBalance} />
          ))}
        </div>
      </div>

      <div className="panel panel-inset">
        <div className="panel-head">
          <h3>Cards</h3>
        </div>
        <div className="mini-card-list">
          {(member.cards || []).map((c) => (
            <div key={c.id} className="mini-card">
              <Icon name="card" size={17} />
              <span>{c.kind} · {maskAccountNumber(c.last4)}</span>
              <span className={`badge ${c.status === 'frozen' ? 'badge-danger' : 'badge-success'}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel panel-inset">
        <div className="panel-head">
          <h3>Post a transaction</h3>
        </div>
        <form className="form-inline" onSubmit={addTx}>
          <label className="field">
            <span>Account</span>
            <select value={txForm.accountType} onChange={(e) => setTxForm((f) => ({ ...f, accountType: e.target.value }))}>
              {(member.accounts || []).map((a) => <option key={a.id} value={a.type}>{a.type}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Type</span>
            <select value={txForm.type} onChange={(e) => setTxForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </label>
          <label className="field">
            <span>Amount</span>
            <input type="number" step="0.01" min="0" value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
          </label>
          <label className="field grow">
            <span>Description</span>
            <input value={txForm.description} onChange={(e) => setTxForm((f) => ({ ...f, description: e.target.value }))} placeholder="Adjustment reason" />
          </label>
          <button className="btn btn-primary">Post</button>
        </form>
      </div>

      <div className="panel panel-inset">
        <div className="panel-head">
          <h3>Recent transactions</h3>
          <button className="link-btn danger" onClick={clearTxs}>Delete all</button>
        </div>
        {txs.length ? (
          <div className="tx-list compact">
            {txs.slice(0, 8).map((t) => (
              <div className="tx-row" key={t.id}>
                <span className={`tx-icon sm ${t.type === 'credit' ? 'in' : 'out'}`}>
                  <Icon name={t.type === 'credit' ? 'download' : 'transfer'} size={14} />
                </span>
                <div className="tx-main">
                  <strong>{t.description}</strong>
                  <small>{formatDateTime(t.date)} · {t.accountType}</small>
                </div>
                <div className={`tx-amount ${t.type === 'credit' ? 'in' : 'out'}`}>
                  {t.type === 'credit' ? '+' : '−'}{currency(t.amount)}
                </div>
                <button
                  className="icon-btn sm"
                  aria-label="Delete transaction"
                  onClick={() => {
                    deleteTransaction(t.id)
                    onToast('Transaction deleted.', 'success')
                  }}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No transactions for this member.</p>
        )}
      </div>

      <div className="admin-detail-actions">
        <button className="btn btn-outline btn-sm" onClick={reset}>
          <Icon name="transfer" size={15} /> Reset transfers
        </button>
        {member.status === 'pending' ? (
          <>
            <button className="btn btn-danger btn-sm" onClick={reject}>Reject application</button>
            <button className="btn btn-primary btn-sm" onClick={approve}>Approve member</button>
          </>
        ) : member.status === 'rejected' ? (
          <button className="btn btn-primary btn-sm" onClick={approve}>Reinstate member</button>
        ) : (
          <button className="btn btn-danger btn-sm" onClick={reject}>Suspend access</button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
    </>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const { push } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dob: '',
    nationality: '',
    maritalStatus: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    alternativeEmail: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    idType: 'Passport',
    idNumber: '',
    checking: '',
    savings: '',
  })

  const users = getUsers()
  const members = users.filter((u) => u.role !== 'admin')
  const selected = users.find((u) => u.uid === selectedId) || null

  const filtered = members.filter((u) => {
    const matchesStatus = status === 'all' || u.status === status
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      displayName(u).toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  const stats = {
    members: members.length,
    pending: members.filter((u) => u.status === 'pending').length,
    active: members.filter((u) => u.status === 'active').length,
    assets: members.reduce(
      (s, u) => s + (u.accounts || []).reduce((a, b) => a + Number(b.available || 0), 0),
      0,
    ),
  }

  const create = (e) => {
    e.preventDefault()
    try {
      if (!newMember.firstName.trim()) throw new Error('Enter first name.')
      if (!newMember.lastName.trim()) throw new Error('Enter last name.')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) throw new Error('Enter a valid email.')
      if (newMember.password.length < 8) throw new Error('Password must be at least 8 characters.')
      if (newMember.confirmPassword !== newMember.password) throw new Error('Passwords do not match.')
      const fullName = `${newMember.firstName.trim()} ${newMember.lastName.trim()}`
      createUserByAdmin({
        name: fullName,
        firstName: newMember.firstName.trim(),
        lastName: newMember.lastName.trim(),
        email: newMember.email.trim(),
        password: newMember.password,
        checking: Number(newMember.checking) || 0,
        savings: Number(newMember.savings) || 0,
        dob: newMember.dob,
        nationality: newMember.nationality,
        maritalStatus: newMember.maritalStatus,
        address: {
          street: newMember.street,
          city: newMember.city,
          state: newMember.state,
          country: newMember.country,
          postalCode: newMember.postalCode,
        },
        phone: newMember.phone,
        alternativeEmail: newMember.alternativeEmail,
        emergencyContact: {
          name: newMember.emergencyName,
          relationship: newMember.emergencyRelation,
          phone: newMember.emergencyPhone,
        },
        idType: newMember.idType,
        idNumber: newMember.idNumber,
      })
      push('Member created and activated.', 'success')
      setCreateOpen(false)
      setNewMember({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dob: '',
        nationality: '',
        maritalStatus: '',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        phone: '',
        alternativeEmail: '',
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',
        idType: 'Passport',
        idNumber: '',
        checking: '',
        savings: '',
      })
    } catch (err) {
      push(err.message, 'error')
    }
  }

  const filters = [
    ['all', 'All', members.length],
    ['pending', 'Pending', stats.pending],
    ['active', 'Active', stats.active],
    ['rejected', 'Rejected', members.filter((u) => u.status === 'rejected').length],
  ]

  return (
    <div className="dash">
      <AppHeader />
      <div className="dash-banner admin-banner">
        <div className="container">
          <Icon name="shield" size={15} />
          Administrator console — changes take effect immediately.
          {user && <span className="banner-right">Signed in as {user.email}</span>}
        </div>
      </div>

      <main className="container dash-container">
        <div className="dash-head">
          <div>
            <span className="eyebrow">Administration</span>
            <h1>Member control center</h1>
            <p className="muted">Review applications, manage balances, and oversee member activity.</p>
          </div>
          <div className="dash-head-actions">
            <Link to="/admin/reset-transfers" className="btn btn-outline">
              <Icon name="transfer" size={16} /> Transfer allowances
            </Link>
            <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={16} /> Create member
            </button>
          </div>
        </div>

        <div className="admin-hero">
          <div>
            <span className="admin-hero-kicker">Total member assets</span>
            <strong className="admin-hero-total">{currency(stats.assets)}</strong>
            <p className="admin-hero-sub">{stats.members} members · {stats.active} active · {stats.pending} pending</p>
          </div>
          <div className="admin-hero-stats">
            <div className="admin-hero-stat">
              <span>Members</span>
              <strong>{stats.members}</strong>
            </div>
            <div className="admin-hero-stat">
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
            <div className="admin-hero-stat">
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>
            <div className="admin-hero-stat">
              <span>Suspended</span>
              <strong>{stats.suspended || 0}</strong>
            </div>
          </div>
        </div>

        <div className="admin-metric-grid">
          <article className="admin-metric">
            <div>
              <span>Members</span>
              <strong>{stats.members}</strong>
            </div>
            <span className="admin-pill">Directory</span>
          </article>
          <article className="admin-metric">
            <div>
              <span>Active</span>
              <strong>{stats.active}</strong>
            </div>
            <span className="admin-pill success">In good standing</span>
          </article>
          <article className="admin-metric">
            <div>
              <span>Pending review</span>
              <strong>{stats.pending}</strong>
            </div>
            <span className="admin-pill warn">Needs action</span>
          </article>
          <article className="admin-metric">
            <div>
              <span>Member assets</span>
              <strong>{currency(stats.assets)}</strong>
            </div>
            <span className="admin-pill">Across accounts</span>
          </article>
        </div>

        <section className="panel panel-elevated">
          <div className="panel-head admin-panel-head">
            <div>
              <h2>Members</h2>
              <p className="panel-sub">Manage accounts and review applications</p>
            </div>
            <div className="admin-controls">
              <label className="search">
                <Icon name="filter" size={16} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, or reference"
                  aria-label="Search members"
                />
              </label>
            </div>
          </div>

          <div className="filter-tabs" role="tablist" aria-label="Filter members">
            {filters.map(([id, label, count]) => (
              <button
                key={id}
                role="tab"
                aria-selected={status === id}
                className={status === id ? 'active' : ''}
                onClick={() => setStatus(id)}
              >
                {label} <span>{count}</span>
              </button>
            ))}
          </div>

          {filtered.length ? (
            <div className="table-wrap">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th scope="col">Member</th>
                    <th scope="col">Status</th>
                    <th scope="col">Role</th>
                    <th scope="col" className="right">Total balance</th>
                    <th scope="col" className="right">Transfers</th>
                    <th scope="col">Joined</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.uid}>
                      <td>
                        <div className="member-cell">
                          <span className="avatar sm">{initials(displayName(m), m.email)}</span>
                          <div>
                            <strong>{displayName(m)}</strong>
                            <small>{m.email}</small>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={m.status} /></td>
                      <td><span className="badge badge-neutral">{m.role}</span></td>
                      <td className="right mono">
                        {currency((m.accounts || []).reduce((s, a) => s + Number(a.available || 0), 0))}
                      </td>
                      <td className="right">{m.transfersUsed || 0} / 5</td>
                      <td>{formatDate(m.createdAt)}</td>
                      <td className="right">
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedId(m.uid)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <span className="icon-tile lg"><Icon name="users" size={22} /></span>
              <strong>No members match</strong>
              <p>Adjust the search or status filter.</p>
            </div>
          )}
        </section>

        <div className="dash-two">
          <section className="panel">
            <div className="panel-head"><h2>Recent sign-ups</h2></div>
            <div className="tx-list compact">
              {members
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((m) => (
                  <div className="tx-row" key={m.uid}>
                    <span className="avatar sm">{initials(displayName(m), m.email)}</span>
                    <div className="tx-main">
                      <strong>{displayName(m)}</strong>
                      <small>{m.email} · {formatDate(m.createdAt)}</small>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
            </div>
          </section>
          <section className="panel">
            <div className="panel-head"><h2>Needs attention</h2></div>
            {stats.pending ? (
              <div className="attention-list">
                {members.filter((m) => m.status === 'pending').map((m) => (
                  <button key={m.uid} className="attention-row" onClick={() => setSelectedId(m.uid)}>
                    <span className="avatar sm">{initials(displayName(m), m.email)}</span>
                    <div>
                      <strong>{displayName(m)}</strong>
                      <small>Waiting for review</small>
                    </div>
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">
                <span className="icon-tile lg green"><Icon name="check" size={22} /></span>
                <strong>All caught up</strong>
                <p>No applications are waiting for review.</p>
              </div>
            )}
          </section>
        </div>

        <footer className="dash-foot">
          <span>© {new Date().getFullYear()} WSB Digital. All rights reserved.</span>
          <div>
            <Link to="/dashboard">Member dashboard</Link>
            <Link to="/">Website</Link>
          </div>
        </footer>
      </main>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Member details"
        subtitle="Review, adjust, and manage this account"
        wide
      >
        {selected && (
          <MemberDetail
            member={selected}
            onClose={() => setSelectedId(null)}
            onToast={push}
          />
        )}
      </Modal>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create a member"
        subtitle="Skips the application queue and activates immediately"
        wide
      >
        <form className="form" onSubmit={create}>
          <div className="panel-inset" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Account Information</h3>
            <div className="form-row">
              <label className="field">
                <span>Email address</span>
                <input type="email" value={newMember.email} onChange={(e) => setNewMember((m) => ({ ...m, email: e.target.value }))} placeholder="member@example.com" />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Password</span>
                <input type="password" value={newMember.password} onChange={(e) => setNewMember((m) => ({ ...m, password: e.target.value }))} placeholder="At least 8 characters" />
              </label>
              <label className="field">
                <span>Confirm Password</span>
                <input type="password" value={newMember.confirmPassword} onChange={(e) => setNewMember((m) => ({ ...m, confirmPassword: e.target.value }))} placeholder="Re-enter password" />
              </label>
            </div>
          </div>

          <div className="panel-inset" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Personal Information</h3>
            <div className="form-row">
              <label className="field">
                <span>First Name</span>
                <input value={newMember.firstName} onChange={(e) => setNewMember((m) => ({ ...m, firstName: e.target.value }))} placeholder="First name" />
              </label>
              <label className="field">
                <span>Last Name</span>
                <input value={newMember.lastName} onChange={(e) => setNewMember((m) => ({ ...m, lastName: e.target.value }))} placeholder="Last name" />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Date of Birth</span>
                <input type="date" value={newMember.dob} onChange={(e) => setNewMember((m) => ({ ...m, dob: e.target.value }))} />
              </label>
              <label className="field">
                <span>Nationality</span>
                <input value={newMember.nationality} onChange={(e) => setNewMember((m) => ({ ...m, nationality: e.target.value }))} placeholder="e.g., American" />
              </label>
              <label className="field">
                <span>Marital Status</span>
                <select value={newMember.maritalStatus} onChange={(e) => setNewMember((m) => ({ ...m, maritalStatus: e.target.value }))}>
                  <option value="">Select</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </label>
            </div>
          </div>

          <div className="panel-inset" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Address Information</h3>
            <label className="field">
              <span>Street Address</span>
              <input value={newMember.street} onChange={(e) => setNewMember((m) => ({ ...m, street: e.target.value }))} placeholder="123 Main St" />
            </label>
            <div className="form-row">
              <label className="field">
                <span>City</span>
                <input value={newMember.city} onChange={(e) => setNewMember((m) => ({ ...m, city: e.target.value }))} placeholder="City" />
              </label>
              <label className="field">
                <span>State/Province</span>
                <input value={newMember.state} onChange={(e) => setNewMember((m) => ({ ...m, state: e.target.value }))} placeholder="State" />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Country</span>
                <input value={newMember.country} onChange={(e) => setNewMember((m) => ({ ...m, country: e.target.value }))} placeholder="Country" />
              </label>
              <label className="field">
                <span>Postal Code</span>
                <input value={newMember.postalCode} onChange={(e) => setNewMember((m) => ({ ...m, postalCode: e.target.value }))} placeholder="ZIP/Postal code" />
              </label>
            </div>
          </div>

          <div className="panel-inset" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Contact Information</h3>
            <div className="form-row">
              <label className="field">
                <span>Phone Number</span>
                <input value={newMember.phone} onChange={(e) => setNewMember((m) => ({ ...m, phone: e.target.value }))} placeholder="+1 555 000 0000" />
              </label>
              <label className="field">
                <span>Alternative Email</span>
                <input type="email" value={newMember.alternativeEmail} onChange={(e) => setNewMember((m) => ({ ...m, alternativeEmail: e.target.value }))} placeholder="alt@example.com" />
              </label>
            </div>
            <h4 style={{ marginTop: '16px', marginBottom: '10px', fontSize: '0.95rem' }}>Emergency Contact</h4>
            <div className="form-row">
              <label className="field">
                <span>Contact Name</span>
                <input value={newMember.emergencyName} onChange={(e) => setNewMember((m) => ({ ...m, emergencyName: e.target.value }))} placeholder="Full name" />
              </label>
              <label className="field">
                <span>Relationship</span>
                <input value={newMember.emergencyRelation} onChange={(e) => setNewMember((m) => ({ ...m, emergencyRelation: e.target.value }))} placeholder="e.g., Spouse, Parent" />
              </label>
              <label className="field">
                <span>Contact Phone</span>
                <input value={newMember.emergencyPhone} onChange={(e) => setNewMember((m) => ({ ...m, emergencyPhone: e.target.value }))} placeholder="+1 555 000 0000" />
              </label>
            </div>
          </div>

          <div className="panel-inset" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Identification Document</h3>
            <div className="form-row">
              <label className="field">
                <span>ID Type</span>
                <select value={newMember.idType} onChange={(e) => setNewMember((m) => ({ ...m, idType: e.target.value }))}>
                  <option value="Passport">Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="National ID">National ID</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="field grow">
                <span>ID Number</span>
                <input value={newMember.idNumber} onChange={(e) => setNewMember((m) => ({ ...m, idNumber: e.target.value }))} placeholder="ID number" />
              </label>
            </div>
          </div>

          <div className="panel-inset" style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '12px' }}>Initial Balances</h3>
            <div className="form-row">
              <label className="field">
                <span>Opening checking</span>
                <input type="number" min="0" step="0.01" value={newMember.checking} onChange={(e) => setNewMember((m) => ({ ...m, checking: e.target.value }))} placeholder="0.00" />
              </label>
              <label className="field">
                <span>Opening savings</span>
                <input type="number" min="0" step="0.01" value={newMember.savings} onChange={(e) => setNewMember((m) => ({ ...m, savings: e.target.value }))} placeholder="0.00" />
              </label>
            </div>
          </div>

          <div className="alert alert-info">
            <Icon name="shield" size={16} /> The new member can sign in immediately with this password.
          </div>
          <button className="btn btn-primary btn-block">Create member</button>
        </form>
      </Modal>
    </div>
  )
}
