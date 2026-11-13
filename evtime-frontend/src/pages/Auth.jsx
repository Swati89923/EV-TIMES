import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Bookmark, Eye, EyeOff, Radio, ShieldCheck, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api/client'
import { inputCls } from '../components/ui'
import useDocumentTitle from '../hooks/useDocumentTitle'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PasswordField({ id, label, error, autoComplete, value, onChange, children }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={`${inputCls} pr-11 ${error ? 'border-red-500' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {children}
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={id} name={id} className={`${inputCls} ${error ? 'border-red-500' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

/** 0-4 based on length and character variety. */
function strength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

function StrengthMeter({ password }) {
  const score = strength(password)
  if (!password) return null
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-brand-500']
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? colors[score] : 'bg-neutral-200 dark:bg-neutral-700'}`} />
        ))}
      </div>
      <p className="mt-1 text-xs text-neutral-500">Password strength: <span className="font-semibold">{labels[score]}</span></p>
    </div>
  )
}

function AuthShell({ title, subtitle, children, footer }) {
  const perks = [
    [Bookmark, 'Save stories', 'Bookmark articles and read them on any device.'],
    [Radio, 'Stay current', 'Live headlines from leading EV publications, all day.'],
    [ShieldCheck, 'Private by design', 'We do not track you for ads, and passwords are stored securely hashed.'],
  ]
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 shadow-sm md:grid-cols-2 dark:border-neutral-800">
      <aside className="relative hidden flex-col justify-between bg-ink p-10 text-white md:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
        <Link to="/" className="relative flex items-center gap-2" aria-label="EV Times home">
          <Zap className="h-7 w-7 fill-brand-500 text-brand-500" />
          <span className="font-headline text-2xl font-extrabold">EV <span className="text-brand-400">TIMES</span></span>
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">The EV news you care about, the moment it happens.</h2>
          <ul className="mt-8 space-y-5">
            {perks.map(([Icon, head, text]) => (
              <li key={head} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400"><Icon className="h-4 w-4" /></span>
                <div>
                  <p className="font-semibold">{head}</p>
                  <p className="text-sm text-neutral-300">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-neutral-400">Free to join. Your account is just a name, an email and a password.</p>
      </aside>

      <div className="p-6 sm:p-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-neutral-500">{footer}</p>
      </div>
    </div>
  )
}

function useAuthForm(action) {
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (values, validate) => {
    const found = validate(values)
    setErrors(found)
    setServerError('')
    if (Object.keys(found).length) return
    setLoading(true)
    try {
      await action(values)
      navigate(location.state?.from || '/', { replace: true })
    } catch (e) {
      const fields = e?.response?.data?.errors
      if (e?.response?.status === 400 && fields && typeof fields === 'object') {
        setErrors(fields)
        setServerError('Please fix the highlighted fields.')
      } else if (e?.response?.status === 401) {
        setServerError('Incorrect email or password.')
      } else {
        setServerError(errorMessage(e, 'Authentication failed. Please try again.'))
      }
    } finally {
      setLoading(false)
    }
  }
  return { errors, serverError, loading, submit }
}

const submitBtn = 'w-full rounded-md bg-ink py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:text-ink dark:hover:bg-brand-400'

function ServerError({ message }) {
  if (!message) return null
  return <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{message}</p>
}

export function Login() {
  useDocumentTitle('Sign in')
  const { login, isAuthenticated } = useAuth()
  const location = useLocation()
  const { errors, serverError, loading, submit } = useAuthForm(login)
  const [password, setPassword] = useState('')
  if (isAuthenticated) return <Navigate to={location.state?.from || '/'} replace />

  const onSubmit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    submit({ email: f.get('email').trim(), password: f.get('password') }, (v) => {
      const err = {}
      if (!EMAIL_RE.test(v.email)) err.email = 'Enter a valid email address'
      if (!v.password) err.password = 'Password is required'
      return err
    })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={location.state?.from ? 'Please sign in to continue.' : 'Sign in to save stories and manage your account.'}
      footer={<>New to EV Times? <Link to="/signup" state={location.state} className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4" aria-busy={loading}>
        <ServerError message={serverError} />
        <Field id="email" type="email" label="Email" autoComplete="email" error={errors.email} />
        <PasswordField id="password" label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <button disabled={loading} className={submitBtn}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  useDocumentTitle('Create account')
  const { signup, isAuthenticated } = useAuth()
  const location = useLocation()
  const { errors, serverError, loading, submit } = useAuthForm(signup)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  if (isAuthenticated) return <Navigate to={location.state?.from || '/'} replace />

  const onSubmit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const values = { name: f.get('name').trim(), email: f.get('email').trim(), password: f.get('password'), confirm: f.get('confirm') }
    submit(values, (v) => {
      const err = {}
      if (!v.name) err.name = 'Name is required'
      if (!EMAIL_RE.test(v.email)) err.email = 'Enter a valid email address'
      if (v.password.length < 6) err.password = 'Password must be at least 6 characters'
      if (v.confirm !== v.password) err.confirm = 'Passwords do not match'
      return err
    })
  }

  return (
    <AuthShell
      title="Join EV Times"
      subtitle="Create a free account to bookmark stories."
      footer={<>Already registered? <Link to="/login" state={location.state} className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4" aria-busy={loading}>
        <ServerError message={serverError} />
        <Field id="name" label="Full name" autoComplete="name" error={errors.name} />
        <Field id="email" type="email" label="Email" autoComplete="email" error={errors.email} />
        <PasswordField id="password" label="Password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password}>
          <StrengthMeter password={password} />
        </PasswordField>
        <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <button disabled={loading} className={submitBtn}>{loading ? 'Creating account...' : 'Create account'}</button>
        <p className="text-center text-xs text-neutral-500">By creating an account you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
      </form>
    </AuthShell>
  )
}
