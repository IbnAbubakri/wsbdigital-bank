export default function Logo({ compact = false }) {
  return (
    <span className="brand">
      <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
        Watertown SavingsBank
      </span>
    </span>
  )
}
