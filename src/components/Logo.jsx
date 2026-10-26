export default function Logo({ compact = false }) {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">
        <img src="/wsb-logo.svg" alt="Watertown Savings Bank" style={{ filter: 'none', width: '100%', height: '100%' }} />
      </span>
    </span>
  )
}
