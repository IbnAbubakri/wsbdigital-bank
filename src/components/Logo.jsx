export default function Logo({ compact = false }) {
  return (
    <span className="brand brand-vertical">
      <span className="brand-mark" aria-hidden="true">
        <img src="/wsb-logo.svg" alt="" />
      </span>
      <span className="brand-text">
        <strong>Watertown Savings</strong>
        <strong>Bank</strong>
      </span>
    </span>
  )
}
