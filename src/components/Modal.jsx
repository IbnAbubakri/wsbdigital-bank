import { useEffect, useRef } from 'react'

function getFocusableElements(container) {
  if (!container) return []
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]
  return Array.from(container.querySelectorAll(selectors.join(','))).filter((el) => {
    if (el.hasAttribute('disabled')) return false
    if (el.getAttribute('aria-hidden') === 'true') return false
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
  })
}

export default function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  const dialogRef = useRef(null)
  const closeBtnRef = useRef(null)
  const lastFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    lastFocusRef.current = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const focusables = getFocusableElements(dialogRef.current)
        if (focusables.length === 0) {
          e.preventDefault()
          return
        }
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current?.contains(document.activeElement)) {
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
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus initial element
    setTimeout(() => {
      const focusables = getFocusableElements(dialogRef.current)
      if (focusables.length > 0) {
        focusables[0].focus()
      } else if (closeBtnRef.current) {
        closeBtnRef.current.focus()
      }
    }, 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
        lastFocusRef.current.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className={`modal ${wide ? 'modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3 id="modal-title">{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button ref={closeBtnRef} className="icon-btn" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
