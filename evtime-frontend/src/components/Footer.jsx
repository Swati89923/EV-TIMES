import { subscribeNewsletter } from '../api/forms'
import { errorMessage } from '../api/client'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowUp, CheckCircle2, Mail, Zap } from 'lucide-react'
import { getCategories } from '../api/news'
import { SOURCES } from '../utils/sources'
import { categoryPath } from '../utils/format'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const svg = { viewBox: '0 0 24 24', fill: 'currentColor', className: 'h-4 w-4', 'aria-hidden': true }
const SOCIALS = [
  {
    name: 'X',
    icon: <svg {...svg}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    name: 'LinkedIn',
    icon: <svg {...svg}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" /></svg>,
  },
  {
    name: 'YouTube',
    icon: <svg {...svg}><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
  {
    name: 'Instagram',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>,
  },
  {
    name: 'GitHub',
    icon: <svg {...svg}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>,
  },
]

function FooterNewsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await subscribeNewsletter(email.trim())
      setDone(true)
      setEmail('')
    } catch (err) {
      setError(errorMessage(err, 'Could not subscribe right now. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-md bg-brand-500/15 px-4 py-3 text-sm font-medium text-brand-400">
        <CheckCircle2 className="h-5 w-5 shrink-0" /> You&apos;re on the list. Look out for the next edition.
      </p>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="footer-email" className="sr-only">Email address</label>
      <div className="flex gap-2">
        <input
          id="footer-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? 'footer-email-err' : undefined}
          className="min-w-0 flex-1 rounded-md bg-white/10 px-3 py-2.5 text-sm text-white outline-none ring-1 ring-white/20 placeholder:text-neutral-400 focus:ring-brand-400"
        />
        <button disabled={busy} className="rounded-md bg-brand-500 px-4 text-sm font-semibold text-ink hover:bg-brand-400 disabled:opacity-60">{busy ? 'Subscribing...' : 'Subscribe'}</button>
      </div>
      {error && <p id="footer-email-err" className="mt-2 text-xs text-red-300">{error}</p>}
    </form>
  )
}

const linkCls = 'hover:text-brand-400'

export default function Footer() {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 300000 })

  return (
    <footer className="mt-16 bg-ink text-neutral-300">
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <Mail className="mt-1 h-9 w-9 shrink-0 text-brand-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">The EV Times Daily</h2>
              <p className="mt-1 text-sm">The day&apos;s most important electric vehicle stories, in your inbox every morning.</p>
            </div>
          </div>
          <FooterNewsletter />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2" aria-label="EV Times home">
            <Zap className="h-6 w-6 fill-brand-500 text-brand-500" />
            <span className="font-headline text-2xl font-extrabold text-white">EV <span className="text-brand-400">TIMES</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6">
            Independent reporting and live headlines on electric vehicles, batteries, charging infrastructure, policy and the markets that move them.
          </p>
          <ul className="mt-5 flex gap-2" aria-label="Follow EV Times">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a href="#" onClick={(e) => e.preventDefault()} aria-label={s.name} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand-500 hover:text-ink">
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Topics">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Topics</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => <li key={c}><Link className={linkCls} to={categoryPath(c)}>{c}</Link></li>)}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className={linkCls} to="/about">About us</Link></li>
            <li><Link className={linkCls} to="/contact">Contact</Link></li>
            <li><Link className={linkCls} to="/careers">Careers</Link></li>
            <li><Link className={linkCls} to="/advertise">Advertise</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className={linkCls} to="/privacy">Privacy Policy</Link></li>
            <li><Link className={linkCls} to="/terms">Terms of Use</Link></li>
            <li><Link className={linkCls} to="/cookies">Cookie Policy</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 text-xs text-neutral-400">
          <p>
            <span className="font-semibold text-neutral-200">Sources we follow:</span> {SOURCES.join(' · ')}. Headlines and summaries link back to the original publisher.
          </p>
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© {new Date().getFullYear()} EV Times. All rights reserved.</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-1 hover:text-brand-400">
              Back to top <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
