import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Contact' },
]

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

export default function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef(null)
  const menuRef = useRef(null)
  const lastFocusRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) {
      if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
        lastFocusRef.current.focus()
      }
      return
    }
    lastFocusRef.current = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusables = getFocusable(menuRef.current)
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || !menuRef.current?.contains(document.activeElement)) {
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
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      const focusables = getFocusable(menuRef.current)
      if (focusables.length > 0) focusables[0].focus()
    }, 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" aria-label="WSB Digital home">
          <Logo />
        </Link>

        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to={home} className="btn btn-ghost btn-sm">
            {user ? 'Go to portal' : 'Sign in'}
          </Link>
          <Link to="/signup" className="btn btn-outline btn-sm">
            Open an account
          </Link>
          <button
            ref={toggleRef}
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" ref={menuRef} className="mobile-menu" role="menu">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="mobile-link"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to={home} className="mobile-link" role="menuitem" onClick={() => setOpen(false)}>
            {user ? 'Go to portal' : 'Sign in'}
          </Link>
          <Link to="/signup" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
            Open an account
          </Link>
        </div>
      )}
    </header>
  )
}
