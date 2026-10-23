import { useState } from 'react'
import Icon from '../components/Icons'
import { useToast } from '../components/Toast'

const topics = [
  'Open an account',
  'Existing account support',
  'Loans & mortgages',
  'Business banking',
  'Something else',
]

export default function Contact() {
  const { push } = useToast()
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '' })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      push('Please fill in your name, email, and message.', 'error')
      return
    }
    push('Thanks — your message has been sent. We will reply within one business day.', 'success')
    setForm({ name: '', email: '', topic: topics[0], message: '' })
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow light">Contact</span>
          <h1>We are here to help</h1>
          <p>
            Reach out about accounts, loans, or business banking. Our team is
            here to help.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-form-card">
            <h2>Send a message</h2>
            <p className="muted">We will reply within one business day.</p>
            <form onSubmit={submit} className="form" noValidate>
              <div className="form-row">
                <label className="field">
                  <span>Full name</span>
                  <input name="name" autoComplete="name" value={form.name} onChange={update('name')} placeholder="Jordan Blake" required aria-required="true" />
                </label>
                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    required
                    aria-required="true"
                  />
                </label>
              </div>
              <label className="field">
                <span>How can we help?</span>
                <select value={form.topic} onChange={update('topic')}>
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Message</span>
                <textarea
                  rows="5"
                  value={form.message}
                  onChange={update('message')}
                  placeholder="Tell us a little about what you need…"
                  required
                  aria-required="true"
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Send message <Icon name="arrow" size={16} />
              </button>
              <p className="form-note">
                <Icon name="shield" size={15} />
                Your details are encrypted and never shared.
              </p>
            </form>
          </div>

          <aside className="contact-aside">
            <div className="contact-tile">
              <span className="icon-tile"><Icon name="phone" size={20} /></span>
              <div>
                <strong>Call us</strong>
                <p>(617) 555-0142</p>
                <small>Mon–Fri, 8am–6pm ET</small>
              </div>
            </div>
            <div className="contact-tile">
              <span className="icon-tile"><Icon name="mail" size={20} /></span>
              <div>
                <strong>Email</strong>
                <p>support@wsbdigital.com</p>
                <small>Replies within one business day</small>
              </div>
            </div>
            <div className="contact-tile">
              <span className="icon-tile"><Icon name="pin" size={20} /></span>
              <div>
                <strong>Headquarters</strong>
                <p>100 Franklin Street, Suite 400</p>
                <small>Boston, MA 02110</small>
              </div>
            </div>
            <div className="contact-tile">
              <span className="icon-tile"><Icon name="clock" size={20} /></span>
              <div>
                <strong>Branch hours</strong>
                <p>Mon–Fri: 8am–6pm</p>
                <small>Sat: 9am–1pm · Sun: closed</small>
              </div>
            </div>

            <div className="schedule-card">
              <h3>Prefer to talk it through?</h3>
              <p>Book a 20-minute session with a financial advisor.</p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => push('Thanks — we will be in touch to confirm a time.', 'success')}
              >
                Schedule a meeting
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="map-placeholder">
            <div className="map-grid" />
            <div className="map-pin">
              <Icon name="pin" size={22} />
              WSB Digital · Franklin Street
            </div>
            <span className="map-note">Boston, MA · Financial District</span>
          </div>
        </div>
      </section>
    </>
  )
}
