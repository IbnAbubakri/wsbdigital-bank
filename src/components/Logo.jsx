export default function Logo({ compact = false }) {
  return (
    <span className="brand">
      <img src="/wsb-logo.svg" alt="Watertown Savings Bank" style={{ height: '42px', width: 'auto', display: 'block', filter: 'none' }} />
    </span>
  )
}
