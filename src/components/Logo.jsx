export default function Logo({ compact = false }) {
  return (
    <span className="brand brand-vertical">
      <span className="brand-mark" aria-hidden="true">
        <img src="/wsb-logo.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </span>
      <span className="brand-text">
        <strong>Watertown Savings</strong>
        <strong>Bank</strong>
      </span>
    </span>
  )
}
