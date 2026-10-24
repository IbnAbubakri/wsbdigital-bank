import { Link } from 'react-router-dom'
import Icon from '../components/Icons'

const solutions = [
  {
    icon: 'wallet',
    title: 'Personal banking',
    text: 'Smart, simple accounts for everyday life — with none of the usual friction.',
    items: ['Everyday & Advantage checking', 'High-yield savings', 'Debit and credit cards'],
  },
  {
    icon: 'building',
    title: 'Business solutions',
    text: 'Banking, payments, and tools that keep your operation moving.',
    items: ['Business checking', 'Merchant services', 'Payroll & invoicing'],
  },
  {
    icon: 'chart',
    title: 'Wealth management',
    text: 'Guidance and portfolios designed around the future you are building.',
    items: ['Personal advisory', 'Retirement planning', 'Managed portfolios'],
  },
]

const features = [
  {
    icon: 'phone',
    title: 'Digital banking',
    text: 'Bank securely from anywhere with a fast, focused mobile experience.',
    stat: '98% member satisfaction',
  },
  {
    icon: 'trend',
    title: 'Smart investing',
    text: 'Goal-based strategies with transparent tracking and no surprises.',
    stat: '$2B+ assets under management',
  },
  {
    icon: 'users',
    title: 'Community impact',
    text: 'A share of every milestone goes back into local neighborhoods.',
    stat: '$5M+ community fund',
  },
]

const testimonials = [
  {
    quote:
      'WSB Digital helped me grow my business with a genuinely personal approach to commercial banking.',
    name: 'Maya Ortiz',
    role: 'Small business owner',
  },
  {
    quote:
      'The mortgage team made my dream of homeownership feel simple, clear, and completely doable.',
    name: 'Daniel Reyes',
    role: 'First-time homeowner',
  },
  {
    quote:
      'Their student banking tools and financial education helped me start my journey with confidence.',
    name: 'Aisha Patel',
    role: 'Graduate student',
  },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              Member-owned since 1973
              <span className="rule" />
            </span>
            <h1>
              Banking that remembers you&rsquo;re <em>a person</em>.
            </h1>
            <p>
              A member-owned credit union with everyday accounts, lending, and
              advice — built to feel simple, human, and fast, wherever you bank.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)', border: 'none', fontWeight: 600 }}>
                Sign in to online banking
                <Icon name="arrow" size={18} />
              </Link>
              <Link to="/products" className="btn btn-outline-light btn-lg" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 600 }}>
                See what we offer
              </Link>
            </div>
            <div className="hero-trust">
              <div>
                <strong>Member-owned</strong>
                <span>Account holders have a vote</span>
              </div>
              <div>
                <strong>Est. 1973</strong>
                <span>Built for the long run</span>
              </div>
              <div>
                <strong>Local</strong>
                <span>Decisions made nearby</span>
              </div>
            </div>
          </div>

          <div className="hero-preview" aria-hidden="true">
            <div className="preview-window">
              <div className="preview-bar">
                <span className="preview-dots"><i /><i /><i /></span>
                <span className="preview-title">My Accounts</span>
                <span className="preview-live"><span className="dot green" />Secure</span>
              </div>
              <div className="preview-body">
                <div className="preview-balance">
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Total available</span>
                    <strong style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}>$12,480.55</strong>
                  </div>
                  <span className="preview-delta" style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>+2.4% this month</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '4px' }}>Checking</div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>$8,245.30</div>
                  </div>
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '4px' }}>Savings</div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>$4,235.25</div>
                  </div>
                </div>
                <div className="preview-chart-label" style={{ marginTop: '16px' }}>
                  <span>Recent activity</span>
                  <span style={{ color: 'var(--blue)', fontWeight: 500 }}>View all</span>
                </div>
                <ul className="preview-list">
                  <li>
                    <span className="preview-icon"><Icon name="wallet" size={15} /></span>
                    <span className="preview-what">Direct deposit · Northwind</span>
                    <span className="preview-amt positive">+$3,200.00</span>
                  </li>
                  <li>
                    <span className="preview-icon"><Icon name="building" size={15} /></span>
                    <span className="preview-what">Whole Foods Market</span>
                    <span className="preview-amt">−$86.42</span>
                  </li>
                  <li>
                    <span className="preview-icon"><Icon name="transfer" size={15} /></span>
                    <span className="preview-what">Transfer to savings</span>
                    <span className="preview-amt">−$500.00</span>
                  </li>
                </ul>
                <div className="preview-foot">
                  <span>Last updated just now</span>
                  <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }}></span> All systems operational</span>
                </div>
              </div>
            </div>
            <p className="preview-note">Bank securely from anywhere, anytime.</p>
          </div>
        </div>
      </section>

      <section className="quick-section">
        <div className="container quick-grid">
          <Link to="/login" className="quick-card">
            <span className="quick-icon">
              <Icon name="wallet" />
            </span>
            <div>
              <strong>Online banking</strong>
              <p>Access your accounts 24/7</p>
            </div>
            <Icon name="arrow" className="quick-arrow" />
          </Link>
          <Link to="/products#calculators" className="quick-card">
            <span className="quick-icon">
              <Icon name="calculator" />
            </span>
            <div>
              <strong>Loan calculator</strong>
              <p>Plan your next big purchase</p>
            </div>
            <Icon name="arrow" className="quick-arrow" />
          </Link>
          <Link to="/contact" className="quick-card">
            <span className="quick-icon">
              <Icon name="calendar" />
            </span>
            <div>
              <strong>Schedule a meeting</strong>
              <p>Talk to a financial advisor</p>
            </div>
            <Icon name="arrow" className="quick-arrow" />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">What we offer</span>
            <h2>Comprehensive financial solutions</h2>
            <p>
              Discover a range of services designed to support your financial
              journey at every step.
            </p>
          </div>
          <div className="solutions-grid">
            {solutions.map((s) => (
              <article key={s.title} className="solution-card">
                <span className="icon-tile">
                  <Icon name={s.icon} size={24} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="check-list">
                  {s.items.map((item) => (
                    <li key={item}>
                      <Icon name="check" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/products" className="text-link">
                  Explore options <Icon name="arrow" size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Innovation at every step</span>
            <h2>Modern banking, human service</h2>
            <p>
              Technology should remove friction, not the relationship. Here is
              how we bring that experience to life.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <article key={f.title} className="feature-card">
                <span className="icon-tile soft">
                  <Icon name={f.icon} size={24} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <span className="feature-stat">{f.stat}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Member stories</span>
            <h2>Trusted by our community</h2>
            <p>Hear from members who bank with us every day.</p>
          </div>
          <div className="testimonial-grid">
            {testimonials.map((t) => (
              <figure key={t.name} className="testimonial">
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption>
                  <span className="avatar avatar-sm">
                    {t.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.role}</small>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container community">
          <div className="community-copy">
            <span className="eyebrow">Community first</span>
            <h2>Making a difference, beyond banking</h2>
            <p>
              We believe in giving back. Our commitment to community development
              goes beyond accounts and cards — it is about building a better
              future together.
            </p>
            <ul className="check-list">
              <li><Icon name="check" size={16} /> Financial literacy workshops</li>
              <li><Icon name="check" size={16} /> Small business micro-grants</li>
              <li><Icon name="check" size={16} /> Local volunteer days</li>
            </ul>
            <Link to="/about" className="btn btn-outline-light">
              Learn about our impact <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="impact-panel">
            <div className="impact-stat">
              <strong>12,400</strong>
              <span>Members</span>
            </div>
            <div className="impact-stat">
              <strong>$5M+</strong>
              <span>Community fund</span>
            </div>
            <div className="impact-stat">
              <strong>38</strong>
              <span>Local partners</span>
            </div>
            <div className="impact-note">
              <Icon name="users" size={18} />
              Built around people, not products.
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Open an account that works for you.</h2>
            <p>
              Apply in minutes and get access to transfers, cards, statements,
              and support whenever you need it.
            </p>
          </div>
          <div className="cta-actions">
            <Link to="/signup" className="btn btn-brass btn-lg">
              Open an account
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
