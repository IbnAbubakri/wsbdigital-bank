import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Logo />
          </Link>
          <p>
            Member-owned banking for everyday life, big plans, and the
            businesses that keep our communities moving.
          </p>
          <span className="badge badge-success">Member-owned since 1973</span>
        </div>

        <div>
          <h4>Quick links</h4>
          <ul className="footer-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h4>Products</h4>
          <ul className="footer-list">
            <li><Link to="/products#checking">Checking</Link></li>
            <li><Link to="/products#savings">Savings</Link></li>
            <li><Link to="/products#cards">Credit cards</Link></li>
            <li><Link to="/products#loans">Loans</Link></li>
            <li><Link to="/products#business">Business</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer-list">
            <li>support@wsbdigital.com</li>
            <li>(617) 555-0142</li>
            <li>Mon–Fri, 8am–6pm ET</li>
            <li>100 Franklin Street, Suite 400</li>
            <li>Boston, MA 02110</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} WSB Digital. All rights reserved.</p>
        <div className="footer-legal">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Accessibility</span>
          <span className="mono">Routing #211385600</span>
        </div>
      </div>
    </footer>
  )
}
