import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from '../components/Icons'
import { currency } from '../lib/format'

const sections = [
  {
    id: 'checking',
    eyebrow: 'Everyday banking',
    title: 'Checking accounts',
    desc: 'Simple accounts with no surprises, built for daily life.',
    products: [
      {
        name: 'Everyday Checking',
        badge: 'Most popular',
        rate: '$0',
        rateLabel: 'monthly fee',
        text: 'A straightforward account with everything you need and nothing you do not.',
        features: ['No minimum balance', 'Free debit card', 'Early direct deposit', '60,000+ fee-free ATMs'],
      },
      {
        name: 'Advantage Checking',
        badge: 'Earn more',
        rate: '3.00%',
        rateLabel: 'APY on balances',
        text: 'Higher yield for members who keep a little more in their checking account.',
        features: ['3.00% APY', 'No ATM fees', 'Priority support', 'Rate boost with direct deposit'],
      },
    ],
  },
  {
    id: 'savings',
    eyebrow: 'Grow your money',
    title: 'Savings & CDs',
    desc: 'Put your goals on a predictable path with transparent rates.',
    products: [
      {
        name: 'High-Yield Savings',
        badge: '4.25% APY',
        rate: '4.25%',
        rateLabel: 'annual percentage yield',
        text: 'A flexible savings account that actually keeps up with your plans.',
        features: ['No monthly fee', 'Automatic savings rules', 'Goal buckets', 'Deposit protection included'],
      },
      {
        name: '12-Month CD',
        badge: 'Locked rate',
        rate: '4.80%',
        rateLabel: 'APY for 12 months',
        text: 'A fixed rate for a fixed term — ideal for money you will not need soon.',
        features: ['Fixed 4.80% APY', '$500 minimum', 'Automatic renewal option', 'No funding fees'],
      },
    ],
  },
  {
    id: 'cards',
    eyebrow: 'Spend smarter',
    title: 'Credit cards',
    desc: 'Cards with clear rewards, no annual-fee tricks, and real controls.',
    products: [
      {
        name: 'Everyday Cash',
        badge: '2% back',
        rate: '2%',
        rateLabel: 'cash back on everything',
        text: 'Flat cash back with no categories to track and no annual fee.',
        features: ['2% unlimited cash back', '$0 annual fee', 'Freeze from the app', 'No foreign transaction fees'],
      },
      {
        name: 'Travel Rewards',
        badge: '3x points',
        rate: '3x',
        rateLabel: 'points on travel',
        text: 'For members who would rather be somewhere else — points on flights, hotels, and dining.',
        features: ['3x points on travel & dining', 'No foreign transaction fees', 'Trip protection', 'Lounge access'],
      },
    ],
  },
  {
    id: 'loans',
    eyebrow: 'Borrow with clarity',
    title: 'Loans',
    desc: 'Straightforward terms and a calculator so you can see the whole picture.',
    products: [
      {
        name: 'Auto Loan',
        badge: 'From 5.9% APR',
        rate: '5.90%',
        rateLabel: 'APR from',
        text: 'New or used, refinance or purchase — with a decision you can plan around.',
        features: ['Terms 24–84 months', 'No prepayment penalty', 'Pre-approval in minutes', 'Rate discount with autopay'],
      },
      {
        name: 'Personal Loan',
        badge: 'From 7.4% APR',
        rate: '7.40%',
        rateLabel: 'APR from',
        text: 'Consolidate, renovate, or cover the unexpected with a fixed plan.',
        features: ['Up to $50,000', 'Terms 12–60 months', 'Fixed monthly payment', 'No origination fee'],
      },
      {
        name: 'Home Loan',
        badge: 'From 6.2% APR',
        rate: '6.20%',
        rateLabel: 'APR from',
        text: 'Guidance from first conversation through closing day.',
        features: ['Fixed & adjustable options', 'Local processing team', 'Rate lock options', 'Closing cost estimate'],
      },
    ],
  },
  {
    id: 'business',
    eyebrow: 'For your business',
    title: 'Business banking',
    desc: 'Keep operations, payments, and people in one place.',
    products: [
      {
        name: 'Business Checking',
        badge: 'Built to scale',
        rate: '$0',
        rateLabel: 'base monthly fee',
        text: 'A business account that grows with headcount and revenue.',
        features: ['Unlimited transactions', 'Team roles & permissions', 'Accounting exports', 'Cash flow insights'],
      },
      {
        name: 'Merchant Payments',
        badge: 'Next day',
        rate: '2.6%',
        rateLabel: '+ 10¢ per transaction',
        text: 'Accept payments online and in person with transparent processing.',
        features: ['Card & contactless', 'Next-day payouts', 'Refund management', 'Simple reporting'],
      },
    ],
  },
]

export default function Products() {
  const { hash } = useLocation()
  const [amount, setAmount] = useState(15000)
  const [term, setTerm] = useState(60)
  const [rate, setRate] = useState(5.9)

  useEffect(() => {
    if (!hash || hash.length <= 1) return
    const id = hash.slice(1)
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) return
    const el = document.getElementById(id)
    if (el) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }, [hash])

  const monthly = useMemo(() => {
    const p = Math.max(Number(amount) || 0, 0)
    const n = Math.max(Number(term) || 1, 1)
    const r = (Number(rate) || 0) / 100 / 12
    if (!p) return 0
    if (!r) return p / n
    return (p * r * (1 + r) ** n) / ((1 + r) ** n - 1)
  }, [amount, term, rate])

  const totalInterest = Math.max(monthly * Number(term || 0) - Number(amount || 0), 0)

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero-inner">
          <span className="eyebrow light">Products</span>
          <h1>Accounts and tools for every chapter</h1>
          <p>
            Transparent, straightforward products. Rates shown are illustrative
            and subject to change.
          </p>
          <nav className="chip-nav" aria-label="Product categories">
            <a href="#checking">Checking</a>
            <a href="#savings">Savings</a>
            <a href="#cards">Cards</a>
            <a href="#loans">Loans</a>
            <a href="#business">Business</a>
            <a href="#calculators">Calculator</a>
          </nav>
        </div>
      </section>

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`section ${index % 2 === 1 ? 'section-tint' : ''}`}
        >
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{section.eyebrow}</span>
              <h2>{section.title}</h2>
              <p>{section.desc}</p>
            </div>
            <div className="product-grid">
              {section.products.map((p, i) => (
                <article
                  key={p.name}
                  className={`product-card${index === 0 && i === 0 ? ' product-featured' : ''}`}
                >
                  <div className="product-top">
                    <span className="badge badge-blue">{p.badge}</span>
                  </div>
                  <h3>{p.name}</h3>
                  <div className="product-rate">
                    <strong>{p.rate}</strong>
                    <span>{p.rateLabel}</span>
                  </div>
                  <p>{p.text}</p>
                  <ul className="check-list">
                    {p.features.map((f) => (
                      <li key={f}>
                        <Icon name="check" size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="btn btn-outline btn-block">
                    Open an account
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section id="calculators" className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Plan ahead</span>
            <h2>Loan calculator</h2>
            <p>Adjust the numbers to estimate a monthly payment. Estimates only.</p>
          </div>
          <div className="calculator">
            <div className="calculator-form">
              <label className="field">
                <span>Loan amount</span>
                <div className="input-affix">
                  <span aria-hidden="true">$</span>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </label>
              <label className="field">
                <span>Term (months)</span>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="6"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
                <em>{term} months</em>
                <div className="range-scale"><span>12</span><span>84</span></div>
              </label>
              <label className="field">
                <span>Interest rate (APR %)</span>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
                <em>{Number(rate).toFixed(1)}%</em>
                <div className="range-scale"><span>1%</span><span>15%</span></div>
              </label>
            </div>
            <div className="calculator-result">
              <span className="eyebrow light">Estimated payment</span>
              <strong className="calc-monthly">{currency(monthly)}</strong>
              <span className="calc-sub">per month</span>
              <div className="calc-row">
                <span>Total interest</span>
                <strong>{currency(totalInterest)}</strong>
              </div>
              <div className="calc-row">
                <span>Total paid</span>
                <strong>{currency(monthly * Number(term || 0))}</strong>
              </div>
              <Link to="/contact" className="btn btn-light btn-block">
                Talk to a lending advisor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Not sure which account fits?</h2>
            <p>Tell us what you are trying to do and we will point you in the right direction.</p>
          </div>
          <div className="cta-actions">
            <Link to="/contact" className="btn btn-light btn-lg">Talk to an advisor</Link>
            <Link to="/signup" className="btn btn-outline-light btn-lg">Open an account</Link>
          </div>
        </div>
      </section>
    </>
  )
}
