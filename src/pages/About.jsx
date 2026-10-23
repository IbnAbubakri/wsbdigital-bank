import { Link } from 'react-router-dom'
import Icon from '../components/Icons'

const values = [
  {
    icon: 'users',
    title: 'People before products',
    text: 'Every decision starts with the member on the other side of the screen.',
  },
  {
    icon: 'shield',
    title: 'Radical clarity',
    text: 'Plain language, visible fees, and no fine print designed to confuse.',
  },
  {
    icon: 'spark',
    title: 'Useful innovation',
    text: 'We adopt technology only when it makes banking meaningfully simpler.',
  },
  {
    icon: 'globe',
    title: 'Local by design',
    text: 'Community roots guide where we invest, hire, and lend.',
  },
]

const timeline = [
  { year: '1973', title: 'Founded', text: 'A small group of neighbors pools resources to open a member-first credit union.' },
  { year: '1998', title: 'First digital ledger', text: 'Paper passbooks give way to real-time balances and direct deposit.' },
  { year: '2015', title: 'Mobile first', text: 'The entire branch experience moves into a pocket-sized app.' },
  { year: '2026', title: 'WSB Digital', text: 'A modern digital experience brings the whole credit union to your pocket.' },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow light">Our story</span>
          <h1>Your financial family since 1973</h1>
          <p>
            WSB Digital is a member-owned credit union built around people,
            not products. Five decades in, that idea still guides everything we do.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <span className="eyebrow">Why we exist</span>
            <h2>Banking should feel like a relationship, not a transaction</h2>
            <p className="lede">
              We started with a simple idea: neighbors helping neighbors build
              stability. Five decades later, that idea still shapes every
              product, policy, and conversation.
            </p>
            <p>
              Today, that philosophy translates to digital: clear balances,
              human support, and tools that explain themselves. No dark
              patterns, no hidden fees — just banking that respects your time.
            </p>
            <div className="inline-actions">
              <Link to="/products" className="btn btn-primary">
                Explore products <Icon name="arrow" size={16} />
              </Link>
              <Link to="/contact" className="btn btn-outline">
                Contact the team
              </Link>
            </div>
          </div>
          <aside className="glance-card">
            <h3>At a glance</h3>
            <div className="glance-row"><span>Founded</span><strong>1973</strong></div>
            <div className="glance-row"><span>Members</span><strong>12,400</strong></div>
            <div className="glance-row"><span>Community fund</span><strong>$5M+</strong></div>
            <div className="glance-row"><span>Local partners</span><strong>38</strong></div>
            <div className="glance-row"><span>Member satisfaction</span><strong>98%</strong></div>
            <div className="glance-note">
              <Icon name="lock" size={16} />
              Your information is protected with bank-level security.
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">What guides us</span>
            <h2>Values that scale with us</h2>
          </div>
          <div className="values-grid">
            {values.map((v) => (
              <article key={v.title} className="value-card">
                <span className="icon-tile">
                  <Icon name={v.icon} size={22} />
                </span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Milestones</span>
            <h2>A few chapters from our story</h2>
          </div>
          <ol className="timeline">
            {timeline.map((t) => (
              <li key={t.year}>
                <span className="timeline-year">{t.year}</span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>See the member experience for yourself</h2>
            <p>Sign in to your account or start a new membership application.</p>
          </div>
          <div className="cta-actions">
            <Link to="/login" className="btn btn-light btn-lg">Sign in</Link>
            <Link to="/signup" className="btn btn-outline-light btn-lg">Open an account</Link>
          </div>
        </div>
      </section>
    </>
  )
}
