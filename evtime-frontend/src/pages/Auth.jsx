import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api/client'
import { inputCls } from '../components/ui'
import useDocumentTitle from '../hooks/useDocumentTitle'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={id} className={inputCls} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {error && <p id={`${id}-err`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 p-8 shadow-sm dark:border-neutral-800">
      <div className="mb-6 text-center">
        <Zap className="mx-auto h-8 w-8 fill-brand-500 text-brand-500" />
        <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-neutral-500">{footer}</p>
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
      setServerError(errorMessage(e, 'Authentication failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }
  return { errors, serverError, loading, submit }
}

const submitBtn = 'w-full rounded-md bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60 dark:bg-brand-500 dark:text-ink dark:hover:bg-brand-400'

export function Login() {
  useDocumentTitle('Sign in')
  const { login, isAuthenticated } = useAuth()
  const { errors, serverError, loading, submit } = useAuthForm(login)
  if (isAuthenticated) return <Navigate to="/" replace />

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
    <AuthShell title="Welcome back" subtitle="Sign in to save stories and manage your account." footer={<>New to EV Times? <Link to="/signup" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Create an account</Link></>}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{serverError}</p>}
        <Field id="email" name="email" type="email" label="Email" autoComplete="email" error={errors.email} />
        <Field id="password" name="password" type="password" label="Password" autoComplete="current-password" error={errors.password} />
        <button disabled={loading} className={submitBtn}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  useDocumentTitle('Create account')
  const { signup, isAuthenticated } = useAuth()
  const { errors, serverError, loading, submit } = useAuthForm(signup)
  if (isAuthenticated) return <Navigate to="/" replace />

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
    <AuthShell title="Join EV Times" subtitle="Create a free account to bookmark stories." footer={<>Already registered? <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Sign in</Link></>}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{serverError}</p>}
        <Field id="name" name="name" label="Full name" autoComplete="name" error={errors.name} />
        <Field id="email" name="email" type="email" label="Email" autoComplete="email" error={errors.email} />
        <Field id="password" name="password" type="password" label="Password" autoComplete="new-password" error={errors.password} />
        <Field id="confirm" name="confirm" type="password" label="Confirm password" autoComplete="new-password" error={errors.confirm} />
        <button disabled={loading} className={submitBtn}>{loading ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthShell>
  )
}
