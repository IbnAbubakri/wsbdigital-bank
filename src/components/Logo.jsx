export default function Logo({ compact = false }) {
  return (
    <span className="brand brand-vertical">
      <span className="brand-mark" aria-hidden="true">
        <img src="/wsb-logo.svg" alt="" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
      </span>
      <span className="brand-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
        <span style={{ fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Watertown Savings</span>
        <span style={{ fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Bank</span>
      </span>
    </span>
  )
}
