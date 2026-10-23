import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { displayName, initials } from '../lib/format'
import Logo from './Logo'
import Icon from './Icons'

function getFocusable(container) {
  if (!container) return []
  const sel = [
    'a[href]',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]
  return Array.from(container.querySelectorAll(sel.join(','))).filter((el) => {
    if (el.getAttribute('aria-hidden') === 'true') return false
    return el.offsetWidth > 0 || el.offsetHeight > 0
  })
}

export default function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(null)
  const wrapRef = useRef(null)
  const notifBtnRef = useRef(null)
  const userBtnRef = useRef(null)
  const notifMenuRef = useRef(null)
  const userMenuRef = useRef(null)
  const lastFocusRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenu(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  useEffect(() => {
    if (!menu) {
      if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
        lastFocusRef.current.focus()
      }
      return
    }
    lastFocusRef.current = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMenu(null)
        return
      }
      if (e.key !== 'Tab') return
      const container = menu === 'notif' ? notifMenuRef.current : userMenuRef.current
      const focusables = getFocusable(container)
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || !container?.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => {
      const container = menu === 'notif' ? notifMenuRef.current : userMenuRef.current
      const focusables = getFocusable(container)
      if (focusables.length > 0) focusables[0].focus()
    }, 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [menu])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const name = displayName(user)

  return (
    <header className="appbar">
      <div className="container appbar-inner" ref={wrapRef}>
        <div className="appbar-left">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="nav-brand">
            <Logo />
          </Link>
          <nav className="appbar-links">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                Admin
              </NavLink>
            )}
            <Link to="/">Website</Link>
          </nav>
        </div>

        <div className="appbar-right">
          <div className="menu-wrap">
            <button
              ref={notifBtnRef}
              className="icon-btn"
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-expanded={menu === 'notif'}
              onClick={() => setMenu(menu === 'notif' ? null : 'notif')}
            >
              <Icon name="bell" size={18} />
              <span className="notif-dot" />
            </button>
            {menu === 'notif' && (
              <div ref={notifMenuRef} className="dropdown dropdown-right" role="menu" aria-label="Notifications">
                <div className="dropdown-head">Notifications</div>
                <div className="notif-item" role="menuitem" tabIndex={0}>
                  <span className="notif-badge green" />
                  <div>
                    <strong>Welcome back</strong>
                    <p>Your accounts are up to date.</p>
                  </div>
                </div>
                <div className="notif-item" role="menuitem" tabIndex={0}>
                  <span className="notif-badge blue" />
                  <div>
                    <strong>New statement available</strong>
                    <p>Your latest monthly statement is ready to download.</p>
                  </div>
                </div>
                <div className="notif-item" role="menuitem" tabIndex={0}>
                  <span className="notif-badge amber" />
                  <div>
                    <strong>Security reminder</strong>
                    <p>Review your recent sign-in activity under Security.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="menu-wrap">
            <button
              ref={userBtnRef}
              className="avatar-btn"
              onClick={() => setMenu(menu === 'user' ? null : 'user')}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menu === 'user'}
            >
              <span className="avatar">{initials(name, user?.email)}</span>
              <span className="avatar-meta">
                <strong>{name}</strong>
                <small>{user?.role === 'admin' ? 'Administrator' : 'Member'}</small>
              </span>
            </button>
            {menu === 'user' && (
              <div ref={userMenuRef} className="dropdown dropdown-right" role="menu" aria-label="Account menu">
                <div className="dropdown-head">
                  <strong>{name}</strong>
                  <small>{user?.email}</small>
                </div>
                <Link to="/dashboard?tab=profile" onClick={() => setMenu(null)} role="menuitem">
                  Profile & settings
                </Link>
                <Link to="/dashboard?tab=security" onClick={() => setMenu(null)} role="menuitem">
                  Security
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenu(null)} role="menuitem">
                    Admin console
                  </Link>
                )}
                <button onClick={handleLogout} role="menuitem">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
