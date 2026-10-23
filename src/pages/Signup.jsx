import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import Icon from '../components/Icons'

const initial = {
  email: '',
  password: '',
  confirm: '',
  firstName: '',
  lastName: '',
  dob: '',
  nationality: '',
  maritalStatus: 'Single',
  street: '',
  city: '',
  state: '',
  country: 'United States',
  postalCode: '',
  phone: '',
  altEmail: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  idType: 'Passport',
  idNumber: '',
  fileName: '',
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.')
      return
    }

    setBusy(true)
    try {
      await signup({
        email: form.email.trim(),
        password: form.password,
        personalInfo: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dob: form.dob,
          nationality: form.nationality,
          maritalStatus: form.maritalStatus,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            country: form.country,
            postalCode: form.postalCode,
          },
        },
        contact: {
          phone: form.phone,
          altEmail: form.altEmail,
          emergency: {
            name: form.emergencyName,
            relationship: form.emergencyRelationship,
            phone: form.emergencyPhone,
          },
        },
        documents: {
          idType: form.idType,
          idNumber: form.idNumber,
          fileName: form.fileName,
        },
      })
      navigate('/registration-success')
    } catch (err) {
      setError(err.message || 'Unable to create the account.')
      setBusy(false)
    }
  }

  return (
    <div className="signup-shell">
      <header className="signup-top">
        <Link to="/" className="nav-brand"><Logo /></Link>
        <Link to="/login" className="btn btn-ghost btn-sm">Already a member? Sign in</Link>
      </header>

      <main className="signup-main">
        <div className="signup-head">
          <span className="eyebrow">Open an account</span>
          <h1>Create your account</h1>
          <p>
            Apply online in a few minutes. We will review your details and let
            you know as soon as your account is ready.
          </p>
          <div className="alert alert-info">
            <Icon name="shield" size={17} />
            Your application is encrypted in transit. We only use your details
            to open your account.
          </div>
        </div>

        {error && <div id="signup-error" className="alert alert-error" role="alert" aria-live="assertive">{error}</div>}

        <form onSubmit={submit} className="signup-form" noValidate aria-describedby={error ? 'signup-error' : undefined}>
          <section className="form-section">
            <h2>
              <span className="step-num">1</span> Account information
            </h2>
            <div className="form-grid">
              <label className="field">
                <span>Email address *</span>
                <input type="email" name="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required aria-invalid={Boolean(error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))} />
              </label>
              <label className="field">
                <span>Password *</span>
                <input type="password" name="new-password" autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required aria-invalid={Boolean(error && form.password.length < 8)} />
              </label>
              <label className="field">
                <span>Confirm password *</span>
                <input type="password" name="confirm-password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" required aria-invalid={Boolean(error && form.confirm && form.password !== form.confirm)} />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>
              <span className="step-num">2</span> Personal information
            </h2>
            <div className="form-grid">
              <label className="field">
                <span>First name *</span>
                <input name="given-name" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} placeholder="Casey" required aria-invalid={Boolean(error && !form.firstName.trim())} />
              </label>
              <label className="field">
                <span>Last name *</span>
                <input name="family-name" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} placeholder="Nguyen" required aria-invalid={Boolean(error && !form.lastName.trim())} />
              </label>
              <label className="field">
                <span>Date of birth</span>
                <input type="date" name="bday" autoComplete="bday" value={form.dob} onChange={set('dob')} />
              </label>
              <label className="field">
                <span>Nationality</span>
                <input name="country-name" autoComplete="country-name" value={form.nationality} onChange={set('nationality')} placeholder="United States" />
              </label>
              <label className="field">
                <span>Marital status</span>
                <select value={form.maritalStatus} onChange={set('maritalStatus')}>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>
              <span className="step-num">3</span> Address
            </h2>
            <div className="form-grid">
              <label className="field span-2">
                <span>Street address</span>
                <input name="street-address" autoComplete="street-address" value={form.street} onChange={set('street')} placeholder="48 Harbor Lane" />
              </label>
              <label className="field">
                <span>City</span>
                <input name="address-level2" autoComplete="address-level2" value={form.city} onChange={set('city')} placeholder="Portland" />
              </label>
              <label className="field">
                <span>State / Province</span>
                <input name="address-level1" autoComplete="address-level1" value={form.state} onChange={set('state')} placeholder="ME" />
              </label>
              <label className="field">
                <span>Country</span>
                <input name="country" autoComplete="country-name" value={form.country} onChange={set('country')} placeholder="United States" />
              </label>
              <label className="field">
                <span>Postal code</span>
                <input name="postal-code" autoComplete="postal-code" value={form.postalCode} onChange={set('postalCode')} placeholder="04101" />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>
              <span className="step-num">4</span> Contact details
            </h2>
            <div className="form-grid">
              <label className="field">
                <span>Phone number</span>
                <input type="tel" name="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 010-1234" />
              </label>
              <label className="field">
                <span>Alternative email</span>
                <input type="email" name="email" autoComplete="email" value={form.altEmail} onChange={set('altEmail')} placeholder="optional@example.com" />
              </label>
              <label className="field">
                <span>Emergency contact name</span>
                <input value={form.emergencyName} onChange={set('emergencyName')} placeholder="Morgan Nguyen" />
              </label>
              <label className="field">
                <span>Relationship</span>
                <input value={form.emergencyRelationship} onChange={set('emergencyRelationship')} placeholder="Sibling" />
              </label>
              <label className="field">
                <span>Emergency contact phone</span>
                <input type="tel" value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="(555) 010-5678" />
              </label>
            </div>
          </section>

          <section className="form-section">
            <h2>
              <span className="step-num">5</span> Identification
            </h2>
            <div className="form-grid">
              <label className="field">
                <span>ID type</span>
                <select value={form.idType} onChange={set('idType')}>
                  <option>Passport</option>
                  <option>National ID</option>
                  <option>Driver’s License</option>
                </select>
              </label>
              <label className="field">
                <span>ID number</span>
                <input value={form.idNumber} onChange={set('idNumber')} placeholder="P-0000000" />
              </label>
              <label className="field span-2">
                <span>Upload a document</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.files?.[0]?.name || '' }))}
                />
                <small className="field-hint">
                  {form.fileName
                    ? `Selected: ${form.fileName} — ready to upload.`
                    : 'JPG, PNG, or PDF, up to 10 MB. Your document is never shared.'}
                </small>
              </label>
            </div>
          </section>

          <div className="signup-actions">
            <p className="muted">
              By submitting you agree to our Membership Agreement and Privacy
              Policy. Applications are reviewed by our member services team.
            </p>
            <button className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? <span className="spinner" /> : 'Create account'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
