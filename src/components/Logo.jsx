export default function Logo({ compact = false }) {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <img src="/wsb-logo.svg" alt="WSB Digital" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </span>
      <span className="brand-text">
        <strong style={{ fontSize: '0.95rem', letterSpacing: '-0.01em', fontWeight: 700 }}>WSB Digital</strong>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Member-owned banking</span>
      </span>
    </span>
  )
}
