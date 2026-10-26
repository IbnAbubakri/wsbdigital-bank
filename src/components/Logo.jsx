export default function Logo({ compact = false }) {
  return (
    <span className="brand brand-vertical">
      <img src="/wsb-logo.svg" alt="Watertown Savings Bank" style={{ width: '40px', height: 'auto' }} />
      <span style={{ fontSize: '0.5rem', lineHeight: '1' }}>Watertown Savings</span>
      <span style={{ fontSize: '0.5rem', lineHeight: '1' }}>Bank</span>
    </span>
  )
}
