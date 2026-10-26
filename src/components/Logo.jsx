export default function Logo({ compact = false }) {
  return (
    <span className="brand brand-vertical">
      <img src="/wsb-logo.svg" alt="Watertown Savings Bank" />
      <span>Watertown Savings</span>
      <span>Bank</span>
    </span>
  )
}
