import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import MarketingLayout from './components/MarketingLayout'
import { RequireAdmin, RequireAuth } from './components/Guards'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Products = lazy(() => import('./pages/Products'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'))
const PendingApproval = lazy(() => import('./pages/PendingApproval'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const ResetTransfers = lazy(() => import('./pages/ResetTransfers'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return <div style={{ minHeight: '60vh' }} aria-busy="true" />
}

const TITLES = {
  '/': 'WSB Digital — Member-owned banking',
  '/about': 'About — WSB Digital',
  '/products': 'Products — WSB Digital',
  '/contact': 'Contact — WSB Digital',
  '/login': 'Sign in — WSB Digital',
  '/signup': 'Open an account — WSB Digital',
  '/registration-success': 'Application received — WSB Digital',
  '/pending-approval': 'Application status — WSB Digital',
  '/dashboard': 'Online banking — WSB Digital',
  '/admin': 'Admin console — WSB Digital',
  '/admin/reset-transfers': 'Transfer allowances — WSB Digital',
}

export default function App() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] || 'Page not found — WSB Digital'

    if (hash && hash.length > 1) {
      const id = hash.slice(1)
      if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)) {
        const target = document.getElementById(id)
        if (target) {
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' })
          return
        }
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'instant' })
  }, [pathname, hash])

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reset-transfers"
          element={
            <RequireAdmin>
              <ResetTransfers />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
