import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Modal from '../components/Modal'
import Icon from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import {
  currency,
  displayName,
  formatDate,
  formatDateTime,
  initials,
  maskAccountNumber,
  monthKey,
  monthLabel,
} from '../lib/format'
import {
  changePassword,
  deposit,
  getTransactions,
  getTransfers,
  processTransfer,
  setCardStatus,
  updateUser,
} from '../lib/db'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'transfers', label: 'Transfers', icon: 'transfer' },
  { id: 'cards', label: 'Cards', icon: 'card' },
  { id: 'statements', label: 'Statements', icon: 'download' },
  { id: 'profile', label: 'Profile', icon: 'users' },
  { id: 'security', label: 'Security', icon: 'shield' },
]

const CHANNELS = [
  'Internal transfer',
  'External — US bank',
  'International',
  'WSB member',
  'Bill payment',
]

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function TxRow({ tx, showAccount = true }) {
  const credit = tx.type === 'credit'
  return (
    <div className="tx-row">
      <span className={`tx-icon ${credit ? 'in' : 'out'}`}>
        <Icon name={credit ? 'download' : 'transfer'} size={17} />
      </span>
      <div className="tx-main">
        <strong>{tx.description}</strong>
        <small>
          {formatDate(tx.date)}
          {showAccount ? ` · ${tx.accountType}` : ''} · {tx.category}
        </small>
      </div>
      <div className={`tx-amount ${credit ? 'in' : 'out'}`}>
        {credit ? '+' : '−'}
        {currency(tx.amount)}
      </div>
    </div>
  )
}

function AccountCard({ account, onCopy }) {
  return (
    <article className="account-card">
      <div className="account-top">
        <span className="icon-tile"><Icon name="wallet" size={19} /></span>
        <span className={`badge ${account.type === 'Savings' ? 'badge-blue' : 'badge-neutral'}`}>
          {account.type}
        </span>
      </div>
      <p className="account-label">{account.type} account</p>
      <strong className="account-balance">{currency(account.balance)}</strong>
      <div className="account-meta">
        <span className="mono">{maskAccountNumber(account.number)}</span>
        <span>Available {currency(account.available)}</span>
      </div>
      <button className="link-btn" onClick={() => onCopy(account.number)}>
        <Icon name="copy" size={14} /> Copy full number
      </button>
    </article>
  )
}

function BankCard({ card, large = false, onToggle, busy }) {
  const frozen = card.status === 'frozen'
  return (
    <div className={`bank-card ${large ? 'bank-card-lg' : ''} ${frozen ? 'frozen' : ''}`}>
      <div className="bank-card-top">
        <span className="bank-card-brand">WSB</span>
        <span className="bank-card-kind">{card.kind}</span>
      </div>
      <div className="bank-card-chip" />
      <div className="bank-card-number mono">•••• •••• •••• {card.last4}</div>
      <div className="bank-card-bottom">
        <div>
          <small>Card holder</small>
          <strong>{card.holder}</strong>
        </div>
        <div>
          <small>Expires</small>
          <strong>{card.expiry}</strong>
        </div>
        <span className="bank-card-logo">VISA</span>
      </div>
      {frozen && <div className="bank-card-frozen">FROZEN</div>}
      {onToggle && (
        <button className="bank-card-toggle" onClick={() => onToggle(card)} disabled={busy}>
          <Icon name="freeze" size={14} />
          {frozen ? 'Unfreeze' : 'Freeze'}
        </button>
      )}
    </div>
  )
}

function Empty({ icon = 'chart', title, text }) {
  return (
    <div className="empty">
      <span className="icon-tile lg"><Icon name={icon} size={22} /></span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function Overview({ user, txs, onModal, goTab, onCopy }) {
  const total = (user.accounts || []).reduce((s, a) => s + Number(a.available || 0), 0)
  const limit = 5
  const used = user.transfersUsed || 0
  const pct = Math.min((used / limit) * 100, 100)
  const checking = user.accounts?.find((a) => a.type === 'Checking')
  const savings = user.accounts?.find((a) => a.type === 'Savings')
  const monthTxs = txs.filter((t) => monthKey(t.date) === monthKey(new Date().toISOString()))
  const activeCards = user.cards?.filter((c) => c.status !== 'frozen').length || 0

  return (
    <>
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div>
            <span className="dash-hero-kicker">Portfolio overview</span>
            <div className="dash-hero-balance">
              <span className="dash-hero-label">Total balance</span>
              <strong className="dash-hero-total">{currency(total)}</strong>
            </div>
            <p className="dash-hero-sub">
              {user.accounts?.length || 0} linked accounts · Member since {formatDate(user.createdAt)}
            </p>
          </div>
          <div className="dash-hero-actions">
            <button className="btn btn-primary" onClick={() => goTab('transfers')}>
              <Icon name="transfer" size={16} /> Send money
            </button>
            <button className="btn btn-ghost" onClick={() => onModal('deposit')}>
              <Icon name="plus" size={16} /> Deposit
            </button>
            <button className="btn btn-ghost" onClick={() => onModal('billpay')}>
              <Icon name="building" size={16} /> Pay bill
            </button>
          </div>
        </div>
        <div className="dash-hero-metrics">
          <div className="dash-metric">
            <span className="dash-metric-label">Checking</span>
            <strong>{currency(checking?.available || 0)}</strong>
            <span className="dash-metric-meta">{checking?.number || '—'}</span>
          </div>
          <div className="dash-metric">
            <span className="dash-metric-label">Savings</span>
            <strong>{currency(savings?.available || 0)}</strong>
            <span className="dash-metric-meta">{savings?.number || '—'}</span>
          </div>
          <div className="dash-metric">
            <span className="dash-metric-label">Transfers this cycle</span>
            <strong>{used} / {limit}</strong>
            <span className="dash-metric-meta">{Math.max(limit - used, 0)} remaining</span>
          </div>
          <div className="dash-metric">
            <span className="dash-metric-label">Active cards</span>
            <strong>{activeCards}</strong>
            <span className="dash-metric-meta">{user.cards?.length || 0} total</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <section className="panel panel-elevated">
          <div className="panel-head">
            <div>
              <h2>Recent transactions</h2>
              <p className="panel-sub">Latest activity across all accounts</p>
            </div>
            <div className="panel-actions">
              <button className="link-btn" onClick={() => goTab('statements')}>View all</button>
            </div>
          </div>
          <div className="tx-table">
            {txs.slice(0, 8).map((tx) => (
              <div key={tx.id} className="tx-table-row">
                <div className="tx-table-main">
                  <span className={`tx-dot ${tx.type === 'credit' ? 'credit' : 'debit'}`} />
                  <div>
                    <strong>{tx.description}</strong>
                    <span>{tx.category} · {formatDate(tx.date)}</span>
                  </div>
                </div>
                <div className="tx-table-meta">
                  <span className={tx.type === 'credit' ? 'tx-amount credit' : 'tx-amount debit'}>
                    {tx.type === 'credit' ? '+' : '-'} {currency(tx.amount)}
                  </span>
                  <span className="tx-account">{tx.accountType}</span>
                </div>
              </div>
            ))}
            {!txs.length && <Empty title="No activity yet" text="Your transactions will appear here." />}
          </div>
        </section>

        <aside className="dash-aside">
          <section className="panel panel-elevated panel-compact">
            <div className="panel-head">
              <div>
                <h2>Transfer allowance</h2>
                <p className="panel-sub">Monthly limit</p>
              </div>
              <span className="panel-pill">{Math.max(limit - used, 0)} left</span>
            </div>
            <div className="allowance-bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div className="allowance-meta">
              <span>{used} used</span>
              <span>{limit} total</span>
            </div>
            {used >= limit && (
              <div className="alert alert-warn">
                Allowance reached. Contact an administrator to reset it.
              </div>
            )}
          </section>

          <section className="panel panel-elevated panel-compact">
            <div className="panel-head">
              <div>
                <h2>Quick actions</h2>
                <p className="panel-sub">Frequently used</p>
              </div>
            </div>
            <div className="quick-grid">
              <button className="quick-tile" onClick={() => onModal('billpay')}>
                <span className="quick-icon"><Icon name="building" size={18} /></span>
                <div>
                  <strong>Pay bill</strong>
                  <span>Utilities & services</span>
                </div>
              </button>
              <button className="quick-tile" onClick={() => onModal('deposit')}>
                <span className="quick-icon"><Icon name="download" size={18} /></span>
                <div>
                  <strong>Mobile deposit</strong>
                  <span>Deposit a check</span>
                </div>
              </button>
              <button className="quick-tile" onClick={() => goTab('transfers')}>
                <span className="quick-icon"><Icon name="transfer" size={18} /></span>
                <div>
                  <strong>Transfer</strong>
                  <span>Move funds</span>
                </div>
              </button>
              <button className="quick-tile" onClick={() => goTab('cards')}>
                <span className="quick-icon"><Icon name="card" size={18} /></span>
                <div>
                  <strong>Cards</strong>
                  <span>Manage cards</span>
                </div>
              </button>
            </div>
          </section>

          <section className="panel panel-elevated panel-compact">
            <div className="panel-head">
              <div>
                <h2>This month</h2>
                <p className="panel-sub">At a glance</p>
              </div>
            </div>
            <div className="month-stats">
              <div>
                <span>Transactions</span>
                <strong>{monthTxs.length}</strong>
              </div>
              <div>
                <span>Active cards</span>
                <strong>{activeCards}</strong>
              </div>
              <div>
                <span>Accounts</span>
                <strong>{user.accounts?.length || 0}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className="panel panel-elevated">
        <div className="panel-head">
          <div>
            <h2>Linked accounts</h2>
            <p className="panel-sub">Full account details and activity</p>
          </div>
          <button className="link-btn" onClick={() => goTab('statements')}>View statements</button>
        </div>
        <div className="account-list">
          {(user.accounts || []).map((a) => (
            <AccountCard key={a.id} account={a} onCopy={onCopy} />
          ))}
        </div>
      </section>
    </>
  )
}

function TransfersTab({ user, onToast }) {
  const [form, setForm] = useState({
    channel: CHANNELS[0],
    fromType: 'Checking',
    toType: 'Savings',
    recipient: '',
    accountNumber: '',
    routing: '',
    country: '',
    email: '',
    amount: '',
    memo: '',
  })
  const [busy, setBusy] = useState(false)
  const transfers = getTransfers(user.uid)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const internal = form.channel === 'Internal transfer'

  const submit = (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      let recipient = form.recipient.trim()
      if (form.channel === 'WSB member') recipient = form.email.trim() || recipient
      if (!internal && !recipient) throw new Error('Enter a recipient name.')
      if (!internal && form.channel !== 'WSB member' && form.channel !== 'Bill payment' && !form.accountNumber.trim()) {
        throw new Error('Enter the recipient account number.')
      }
      processTransfer({
        userId: user.uid,
        channel: form.channel,
        fromType: form.fromType,
        toType: internal ? form.toType : undefined,
        recipient,
        amount: form.amount,
        memo: form.memo,
      })
      onToast(`Transfer of ${currency(form.amount)} sent successfully.`, 'success')
      setForm((f) => ({ ...f, amount: '', memo: '', recipient: '', accountNumber: '', routing: '', email: '', country: '' }))
    } catch (err) {
      onToast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-two wide-left">
      <section className="panel">
        <div className="panel-head"><h2>New transfer</h2></div>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>Transfer type</span>
            <select value={form.channel} onChange={set('channel')}>
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <div className="form-row">
            <label className="field">
              <span>From</span>
              <select value={form.fromType} onChange={set('fromType')}>
                {(user.accounts || []).map((a) => (
                  <option key={a.id} value={a.type}>
                    {a.type} — {currency(a.available)}
                  </option>
                ))}
              </select>
            </label>
            {internal ? (
              <label className="field">
                <span>To</span>
                <select value={form.toType} onChange={set('toType')}>
                  {(user.accounts || []).filter((a) => a.type !== form.fromType).map((a) => (
                    <option key={a.id} value={a.type}>{a.type}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="field">
                <span>Recipient name</span>
                <input value={form.recipient} onChange={set('recipient')} placeholder="Alex Morgan" />
              </label>
            )}
          </div>

          {!internal && form.channel === 'WSB member' && (
            <label className="field">
              <span>Recipient email</span>
              <input type="email" value={form.email} onChange={set('email')} placeholder="member@example.com" />
            </label>
          )}

          {!internal && (form.channel === 'External — US bank' || form.channel === 'International') && (
            <div className="form-row">
              <label className="field">
                <span>Account number</span>
                <input value={form.accountNumber} onChange={set('accountNumber')} placeholder="000123456789" />
              </label>
              {form.channel === 'International' ? (
                <label className="field">
                  <span>SWIFT / IBAN</span>
                  <input value={form.routing} onChange={set('routing')} placeholder="WSBQUS33XXX" />
                </label>
              ) : (
                <label className="field">
                  <span>Routing number</span>
                  <input value={form.routing} onChange={set('routing')} placeholder="011000015" />
                </label>
              )}
            </div>
          )}

          {form.channel === 'Bill payment' && (
            <label className="field">
              <span>Payee account number</span>
              <input value={form.accountNumber} onChange={set('accountNumber')} placeholder="Utility account" />
            </label>
          )}

          <div className="form-row">
            <label className="field">
              <span>Amount (USD)</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
            </label>
            <label className="field">
              <span>Memo (optional)</span>
              <input value={form.memo} onChange={set('memo')} placeholder="What is this for?" />
            </label>
          </div>

          <div className="alert alert-info">
            <Icon name="shield" size={16} />
            For your security, transfers above $25,000 require additional
            verification.
          </div>

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? <span className="spinner" /> : `Send ${form.amount ? currency(form.amount) : 'transfer'}`}
          </button>
        </form>
      </section>

      <aside className="panel">
        <div className="panel-head"><h2>Recent transfers</h2></div>
        {transfers.length ? (
          <div className="tx-list">
            {transfers.slice(0, 8).map((t) => (
              <div className="tx-row" key={t.id}>
                <span className="tx-icon out"><Icon name="transfer" size={17} /></span>
                <div className="tx-main">
                  <strong>{t.channel}</strong>
                  <small>{t.recipient} · {formatDateTime(t.date)}</small>
                </div>
                <div className="tx-amount out">−{currency(t.amount)}</div>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon="transfer" title="No transfers yet" text="Your transfers will appear here." />
        )}
      </aside>
    </div>
  )
}

function CardsTab({ user, onToast }) {
  const [busyId, setBusyId] = useState('')
  const [details, setDetails] = useState(null)

  const toggle = (card) => {
    setBusyId(card.id)
    try {
      setCardStatus(user.uid, card.id, card.status === 'frozen' ? 'active' : 'frozen')
      onToast(card.status === 'frozen' ? 'Card unfrozen.' : 'Card frozen.', 'success')
    } catch (err) {
      onToast(err.message, 'error')
    } finally {
      setBusyId('')
    }
  }

  return (
    <>
      <div className="dash-two">
        {(user.cards || []).map((card) => (
          <section className="panel" key={card.id}>
            <div className="panel-head">
              <h2>{card.kind} card</h2>
              <span className={`badge ${card.status === 'frozen' ? 'badge-danger' : 'badge-success'}`}>
                {card.status === 'frozen' ? 'Frozen' : 'Active'}
              </span>
            </div>
            <BankCard card={card} large onToggle={toggle} busy={busyId === card.id} />
            <div className="card-actions">
              <button className="btn btn-outline btn-sm" onClick={() => setDetails(card)}>
                <Icon name="eye" size={15} /> View details
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onToast('A replacement card will arrive in 5–7 business days.', 'info')}
              >
                <Icon name="card" size={15} /> Replace
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (card.status !== 'frozen') {
                    setCardStatus(user.uid, card.id, 'frozen')
                  }
                  onToast('Card reported and frozen. A replacement is on its way.', 'warn')
                }}
              >
                Report lost
              </button>
            </div>
            <div className="card-meta">
              <div><span>Card holder</span><strong>{card.holder}</strong></div>
              <div><span>Expires</span><strong>{card.expiry}</strong></div>
              <div><span>Network</span><strong>{card.brand}</strong></div>
              {card.limit != null && <div><span>Credit limit</span><strong>{currency(card.limit)}</strong></div>}
            </div>
          </section>
        ))}
      </div>

      <section className="panel">
        <div className="panel-head"><h2>Card controls</h2></div>
        <div className="toggle-list">
          <div className="toggle-row">
            <div><strong>Online purchases</strong><p>Allow this card to be used online.</p></div>
            <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
          </div>
          <div className="toggle-row">
            <div><strong>International transactions</strong><p>Allow purchases outside the US.</p></div>
            <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
          </div>
          <div className="toggle-row">
            <div><strong>ATM withdrawals</strong><p>Enable cash withdrawals at ATMs worldwide.</p></div>
            <label className="switch"><input type="checkbox" /><span /></label>
          </div>
        </div>
      </section>

      <Modal
        open={Boolean(details)}
        onClose={() => setDetails(null)}
        title="Card details"
        subtitle="Your card details are encrypted and protected"
      >
        {details && (
          <div className="detail-list">
            <div><span>Card number</span><strong className="mono">4242 4242 4242 {details.last4}</strong></div>
            <div><span>Expiry</span><strong className="mono">{details.expiry}</strong></div>
            <div><span>CVV</span><strong className="mono">•••</strong></div>
            <div><span>Status</span><strong>{details.status}</strong></div>
          </div>
        )}
      </Modal>
    </>
  )
}

function StatementsTab({ user, txs }) {
  const { push } = useToast()
  const [month, setMonth] = useState('all')
  const [account, setAccount] = useState('all')

  const months = [...new Set(txs.map((t) => monthKey(t.date)))].sort().reverse()
  const filtered = txs.filter(
    (t) =>
      (month === 'all' || monthKey(t.date) === month) &&
      (account === 'all' || t.accountType === account),
  )
  const credits = filtered.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const debits = filtered.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  const exportCsv = () => {
    downloadCsv(`wsb-${account === 'all' ? 'all-accounts' : account}-${month}.csv`, [
      ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'],
      ...filtered.map((t) => [formatDateTime(t.date), t.description, t.category, t.accountType, t.type, t.amount.toFixed(2)]),
    ])
    push('Statement downloaded as CSV.', 'success')
  }

  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h2>Statements & activity</h2>
          <button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!filtered.length}>
            <Icon name="download" size={15} /> Download CSV
          </button>
        </div>
        <div className="filters">
          <label className="field">
            <span>Period</span>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="all">All months</option>
              {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Account</span>
            <select value={account} onChange={(e) => setAccount(e.target.value)}>
              <option value="all">All accounts</option>
              {(user.accounts || []).map((a) => <option key={a.id} value={a.type}>{a.type}</option>)}
            </select>
          </label>
        </div>

        <div className="summary-row">
          <div><span>Money in</span><strong className="positive">+{currency(credits)}</strong></div>
          <div><span>Money out</span><strong className="negative">−{currency(debits)}</strong></div>
          <div><span>Net</span><strong>{currency(credits - debits)}</strong></div>
          <div><span>Transactions</span><strong>{filtered.length}</strong></div>
        </div>

        {filtered.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td>
                      <div className="table-desc">
                        <span className={`tx-icon sm ${t.type === 'credit' ? 'in' : 'out'}`}>
                          <Icon name={t.type === 'credit' ? 'download' : 'transfer'} size={14} />
                        </span>
                        {t.description}
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{t.category}</span></td>
                    <td>{t.accountType}</td>
                    <td className={`right ${t.type === 'credit' ? 'positive' : 'negative'}`}>
                      {t.type === 'credit' ? '+' : '−'}{currency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="chart" title="Nothing in this period" text="Try a different month or account." />
        )}
      </section>
    </>
  )
}

function ProfileTab({ user, onToast }) {
  const [form, setForm] = useState({
    firstName: user.personalInfo?.firstName || '',
    lastName: user.personalInfo?.lastName || '',
    dob: user.personalInfo?.dob || '',
    phone: user.contact?.phone || '',
    altEmail: user.contact?.altEmail || '',
    street: user.personalInfo?.address?.street || '',
    city: user.personalInfo?.address?.city || '',
    state: user.personalInfo?.address?.state || '',
    country: user.personalInfo?.address?.country || '',
    postalCode: user.personalInfo?.address?.postalCode || '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = (e) => {
    e.preventDefault()
    try {
      updateUser(user.uid, {
        personalInfo: {
          ...user.personalInfo,
          firstName: form.firstName,
          lastName: form.lastName,
          dob: form.dob,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            country: form.country,
            postalCode: form.postalCode,
          },
        },
        contact: { ...user.contact, phone: form.phone, altEmail: form.altEmail },
      })
      onToast('Profile updated locally.', 'success')
    } catch (err) {
      onToast(err.message, 'error')
    }
  }

  return (
    <div className="dash-two wide-left">
      <section className="panel">
        <div className="panel-head"><h2>Personal details</h2></div>
        <form className="form" onSubmit={save}>
          <div className="form-row">
            <label className="field"><span>First name</span><input value={form.firstName} onChange={set('firstName')} /></label>
            <label className="field"><span>Last name</span><input value={form.lastName} onChange={set('lastName')} /></label>
          </div>
          <div className="form-row">
            <label className="field"><span>Email (read only)</span><input value={user.email} readOnly /></label>
            <label className="field"><span>Date of birth</span><input type="date" value={form.dob} onChange={set('dob')} /></label>
          </div>
          <div className="form-row">
            <label className="field"><span>Phone</span><input value={form.phone} onChange={set('phone')} /></label>
            <label className="field"><span>Alternative email</span><input value={form.altEmail} onChange={set('altEmail')} /></label>
          </div>
          <label className="field"><span>Street address</span><input value={form.street} onChange={set('street')} /></label>
          <div className="form-row three">
            <label className="field"><span>City</span><input value={form.city} onChange={set('city')} /></label>
            <label className="field"><span>State</span><input value={form.state} onChange={set('state')} /></label>
            <label className="field"><span>Postal code</span><input value={form.postalCode} onChange={set('postalCode')} /></label>
          </div>
          <label className="field"><span>Country</span><input value={form.country} onChange={set('country')} /></label>
          <button className="btn btn-primary">Save changes</button>
        </form>
      </section>

      <aside className="panel">
        <div className="panel-head"><h2>Membership</h2></div>
        <div className="member-card">
          <span className="avatar lg">{initials(displayName(user), user.email)}</span>
          <strong>{displayName(user)}</strong>
          <small>{user.email}</small>
          <span className={`badge ${user.role === 'admin' ? 'badge-blue' : 'badge-success'}`}>
            {user.role === 'admin' ? 'Administrator' : 'Member'}
          </span>
        </div>
        <div className="detail-list">
          <div><span>Member since</span><strong>{formatDate(user.createdAt)}</strong></div>
          <div><span>Reference</span><strong className="mono">{user.uid.slice(0, 8).toUpperCase()}</strong></div>
          <div><span>Status</span><strong>Active</strong></div>
          <div><span>Transfers used</span><strong>{user.transfersUsed || 0} of 5</strong></div>
        </div>
        <div className="alert alert-info">
          <Icon name="shield" size={16} /> Keep your personal information up to date. We will never ask for your password by email.
        </div>
      </aside>
    </div>
  )
}

function SecurityTab({ user, onToast, onLogout }) {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const set = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }))

  const change = (e) => {
    e.preventDefault()
    try {
      if (pw.next !== pw.confirm) throw new Error('New passwords do not match.')
      changePassword(user.uid, pw.current, pw.next)
      setPw({ current: '', next: '', confirm: '' })
      onToast('Password updated successfully.', 'success')
    } catch (err) {
      onToast(err.message, 'error')
    }
  }

  const toggle2fa = () => {
    updateUser(user.uid, { twoFactor: !user.twoFactor })
    onToast(user.twoFactor ? 'Two-factor authentication disabled.' : 'Two-factor authentication enabled.', 'info')
  }

  const wipe = () => {
    if (!window.confirm('Reset locally stored data on this device and return to the homepage?')) return
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <div className="dash-two wide-left">
      <section className="panel">
        <div className="panel-head"><h2>Password</h2></div>
        <form className="form" onSubmit={change}>
          <label className="field">
            <span>Current password</span>
            <input type="password" value={pw.current} onChange={set('current')} />
          </label>
          <div className="form-row">
            <label className="field">
              <span>New password</span>
              <input type="password" value={pw.next} onChange={set('next')} />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input type="password" value={pw.confirm} onChange={set('confirm')} />
            </label>
          </div>
          <button className="btn btn-primary">Update password</button>
        </form>
      </section>

      <aside className="panel">
        <div className="panel-head"><h2>Security settings</h2></div>
        <div className="toggle-list">
          <div className="toggle-row">
            <div><strong>Two-factor authentication</strong><p>Adds a second layer of protection at sign-in.</p></div>
            <label className="switch">
              <input type="checkbox" checked={Boolean(user.twoFactor)} onChange={toggle2fa} />
              <span />
            </label>
          </div>
          <div className="toggle-row">
            <div><strong>Login alerts</strong><p>Email me when a new device signs in.</p></div>
            <label className="switch"><input type="checkbox" defaultChecked /><span /></label>
          </div>
        </div>
        <div className="detail-list">
          <div><span>Session</span><strong>This device</strong></div>
          <div><span>Role</span><strong>{user.role}</strong></div>
          <div><span>Last reviewed</span><strong>{formatDate(new Date())}</strong></div>
        </div>
        <button className="btn btn-outline btn-block" onClick={onLogout}>
          <Icon name="logout" size={16} /> Sign out
        </button>
        <button className="btn btn-danger btn-block" onClick={wipe}>
          <Icon name="trash" size={16} /> Reset local data
        </button>
      </aside>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { push } = useToast()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'overview'
  const [modal, setModal] = useState(null)

  const [bill, setBill] = useState({ payee: 'City Power & Light', fromType: 'Checking', amount: '' })
  const [dep, setDep] = useState({ accountType: 'Checking', amount: '', description: 'Mobile deposit' })

  if (!user) return null

  const txs = getTransactions(user.uid)
  const goTab = (id) => setParams(id === 'overview' ? {} : { tab: id })

  const copy = async (number) => {
    try {
      await navigator.clipboard.writeText(number)
      push('Account number copied.', 'success')
    } catch {
      push('Clipboard access is unavailable. Please copy manually.', 'error')
    }
  }

  const sendBill = (e) => {
    e.preventDefault()
    try {
      processTransfer({
        userId: user.uid,
        channel: 'Bill payment',
        fromType: bill.fromType,
        recipient: bill.payee,
        amount: bill.amount,
      })
      push(`Bill payment of ${currency(bill.amount)} scheduled successfully.`, 'success')
      setModal(null)
      setBill({ payee: 'City Power & Light', fromType: 'Checking', amount: '' })
    } catch (err) {
      push(err.message, 'error')
    }
  }

  const sendDeposit = (e) => {
    e.preventDefault()
    try {
      deposit({
        userId: user.uid,
        accountType: dep.accountType,
        amount: dep.amount,
        description: dep.description,
      })
      push('Deposit posted successfully.', 'success')
      setModal(null)
      setDep({ accountType: 'Checking', amount: '', description: 'Mobile deposit' })
    } catch (err) {
      push(err.message, 'error')
    }
  }

  return (
    <div className="dash">
      <AppHeader />

      <div className="container dash-container">
        <div className="dash-head">
          <div>
            <span className="eyebrow">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</span>
            <h1>Welcome back, {displayName(user).split(' ')[0]}</h1>
            <p className="muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="dash-head-actions">
            <button className="btn btn-outline" onClick={() => setModal('deposit')}>
              <Icon name="plus" size={16} /> Deposit
            </button>
            <button className="btn btn-primary" onClick={() => goTab('transfers')}>
              <Icon name="transfer" size={16} /> Transfer money
            </button>
          </div>
        </div>

        <div className="dash-shell">
          <aside className="dash-side">
            <div className="side-user">
              <span className="avatar">{initials(displayName(user), user.email)}</span>
              <div>
                <strong>{displayName(user)}</strong>
                <small>{user.role === 'admin' ? 'Administrator' : 'Member'}</small>
              </div>
            </div>
            <nav className="side-nav" aria-label="Dashboard sections">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={tab === t.id ? 'active' : ''}
                  onClick={() => goTab(t.id)}
                >
                  <Icon name={t.icon} size={18} />
                  {t.label}
                </button>
              ))}
              {user.role === 'admin' && (
                <Link to="/admin" className="side-link">
                  <Icon name="users2" size={18} /> Admin console
                </Link>
              )}
            </nav>
            <div className="side-help">
              <span className="icon-tile"><Icon name="phone" size={17} /></span>
              <strong>Need help?</strong>
              <p>Member support is available Mon–Fri.</p>
              <Link to="/contact" className="link-btn">Contact support</Link>
            </div>
          </aside>

          <main className="dash-main">
            {tab === 'overview' && (
              <Overview user={user} txs={txs} onModal={setModal} goTab={goTab} onCopy={copy} />
            )}
            {tab === 'transfers' && <TransfersTab user={user} onToast={push} />}
            {tab === 'cards' && <CardsTab user={user} onToast={push} />}
            {tab === 'statements' && <StatementsTab user={user} txs={txs} />}
            {tab === 'profile' && <ProfileTab user={user} onToast={push} />}
            {tab === 'security' && (
              <SecurityTab
                user={user}
                onToast={push}
                onLogout={() => {
                  logout()
                }}
              />
            )}
          </main>
        </div>

        <footer className="dash-foot">
          <span>© {new Date().getFullYear()} WSB Digital. All rights reserved.</span>
          <div>
            <Link to="/">Website</Link>
            <Link to="/contact">Support</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
          </div>
        </footer>
      </div>

      <Modal
        open={modal === 'billpay'}
        onClose={() => setModal(null)}
        title="Pay a bill"
        subtitle="Payments are processed securely"
      >
        <form className="form" onSubmit={sendBill}>
          <label className="field">
            <span>Payee</span>
            <select value={bill.payee} onChange={(e) => setBill((b) => ({ ...b, payee: e.target.value }))}>
              <option>City Power & Light</option>
              <option>Water & Sewer</option>
              <option>Fiber Internet</option>
              <option>Beacon Insurance Co.</option>
            </select>
          </label>
          <label className="field">
            <span>From account</span>
            <select value={bill.fromType} onChange={(e) => setBill((b) => ({ ...b, fromType: e.target.value }))}>
              {(user.accounts || []).map((a) => <option key={a.id} value={a.type}>{a.type}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Amount</span>
            <input type="number" min="0" step="0.01" value={bill.amount} onChange={(e) => setBill((b) => ({ ...b, amount: e.target.value }))} placeholder="0.00" />
          </label>
          <button className="btn btn-primary btn-block">Pay bill</button>
        </form>
      </Modal>

      <Modal
        open={modal === 'deposit'}
        onClose={() => setModal(null)}
        title="Deposit a check"
        subtitle="Deposit checks from anywhere"
      >
        <form className="form" onSubmit={sendDeposit}>
          <div className="deposit-drop">
            <Icon name="download" size={22} />
            <strong>Mobile check deposit</strong>
            <p>Upload a photo of the front and back of your check.</p>
          </div>
          <label className="field">
            <span>Deposit to</span>
            <select value={dep.accountType} onChange={(e) => setDep((d) => ({ ...d, accountType: e.target.value }))}>
              {(user.accounts || []).map((a) => <option key={a.id} value={a.type}>{a.type}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Amount</span>
            <input type="number" min="0" step="0.01" value={dep.amount} onChange={(e) => setDep((d) => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
          </label>
          <label className="field">
            <span>Description</span>
            <input value={dep.description} onChange={(e) => setDep((d) => ({ ...d, description: e.target.value }))} />
          </label>
          <button className="btn btn-primary btn-block">Post deposit</button>
        </form>
      </Modal>
    </div>
  )
}
