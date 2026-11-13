import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BatteryCharging, Briefcase, CheckCircle2, Globe2, Mail, Megaphone, ShieldCheck } from 'lucide-react'
import { inputCls } from '../components/ui'
import useDocumentTitle from '../hooks/useDocumentTitle'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Page({ eyebrow, title, intro, children }) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">{title}</h1>
      {intro && <p className="mt-5 text-lg leading-8 text-neutral-600 dark:text-neutral-300">{intro}</p>}
      <div className="mt-8 space-y-6 leading-7 text-neutral-700 dark:text-neutral-300">{children}</div>
    </div>
  )
}

const H2 = ({ children }) => <h2 className="pt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{children}</h2>

export function About() {
  useDocumentTitle('About us', 'EV Times is an independent newsroom covering the electric vehicle industry.')
  const values = [
    [BatteryCharging, 'Focused coverage', 'Batteries, charging, vehicles, policy and markets - everything that powers the EV transition.'],
    [ShieldCheck, 'Independent & accurate', 'We verify what we publish and correct what we get wrong, quickly and visibly.'],
    [Globe2, 'Global perspective', 'From Indian roads to European regulation, we follow the stories that shape mobility worldwide.'],
  ]
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">About</p>
      <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">News for the electric age</h1>
      <p className="mt-5 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
        EV Times is a digital newsroom dedicated to electric mobility. We publish our own coverage and bring together live headlines from leading EV publications, always linking back to the original source, so readers can make sense of an industry that is changing every week.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {values.map(([Icon, title, text]) => (
          <div key={title} className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
            <Icon className="h-7 w-7 text-brand-600" />
            <h2 className="mt-3 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Contact() {
  useDocumentTitle('Contact us', 'Get in touch with the EV Times team.')
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const found = {}
    if (!f.get('name').trim()) found.name = 'Please tell us your name'
    if (!EMAIL_RE.test(f.get('email').trim())) found.email = 'Enter a valid email address'
    if (f.get('message').trim().length < 10) found.message = 'Please write at least a sentence or two'
    setErrors(found)
    if (!Object.keys(found).length) setSent(true)
  }

  return (
    <Page eyebrow="Contact" title="We'd love to hear from you" intro="Story tip, correction, partnership idea or feedback on the site - send us a note.">
      {sent ? (
        <p role="status" className="flex items-center gap-3 rounded-xl bg-brand-50 p-5 font-medium text-brand-700 dark:bg-neutral-900 dark:text-brand-400">
          <CheckCircle2 className="h-6 w-6 shrink-0" /> Thanks for reaching out.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          {[['name', 'Your name', 'text', 'name'], ['email', 'Email', 'email', 'email']].map(([id, label, type, auto]) => (
            <div key={id}>
              <label htmlFor={`c-${id}`} className="mb-1 block text-sm font-medium">{label}</label>
              <input id={`c-${id}`} name={id} type={type} autoComplete={auto} className={inputCls} aria-invalid={!!errors[id]} />
              {errors[id] && <p className="mt-1 text-xs text-red-600">{errors[id]}</p>}
            </div>
          ))}
          <div>
            <label htmlFor="c-message" className="mb-1 block text-sm font-medium">Message</label>
            <textarea id="c-message" name="message" rows={5} className={inputCls} aria-invalid={!!errors.message} />
            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
          </div>
          <button className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-brand-500 dark:text-ink dark:hover:bg-brand-400">Send message</button>
        </form>
      )}
      <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-brand-600" /> This form is a demo and does not send mail yet.</p>
    </Page>
  )
}

export function Careers() {
  useDocumentTitle('Careers', 'Work with EV Times.')
  return (
    <Page eyebrow="Careers" title="Build the future of EV news" intro="We are a small team that cares about clear, accurate reporting on electric mobility.">
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <Briefcase className="mt-1 h-6 w-6 shrink-0 text-brand-600" />
        <p>There are no open positions right now. If you are a reporter, editor or engineer who loves this beat, <Link to="/contact" className="font-semibold text-brand-700 underline dark:text-brand-400">get in touch</Link> and tell us what you would like to work on.</p>
      </div>
    </Page>
  )
}

export function Advertise() {
  useDocumentTitle('Advertise', 'Reach an engaged EV audience.')
  return (
    <Page eyebrow="Advertise" title="Reach people who care about EVs" intro="Sponsorships and partnerships that respect our readers and our editorial independence.">
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
        <Megaphone className="mt-1 h-6 w-6 shrink-0 text-brand-600" />
        <p>Sponsored content is always clearly labelled and never mixed with news. To discuss options, <Link to="/contact" className="font-semibold text-brand-700 underline dark:text-brand-400">contact us</Link>.</p>
      </div>
    </Page>
  )
}

export function Privacy() {
  useDocumentTitle('Privacy Policy')
  return (
    <Page eyebrow="Legal" title="Privacy Policy" intro="How EV Times handles information about you.">
      <H2>What we collect</H2>
      <p>If you create an account we store your name, email address and a securely hashed password, plus the articles you bookmark. We do not collect payment information.</p>
      <H2>How we use it</H2>
      <p>Your details are used only to run your account, keep you signed in and save your bookmarks. We do not sell personal data.</p>
      <H2>Cookies and storage</H2>
      <p>We store your sign-in token and theme preference in your browser. See the <Link to="/cookies" className="font-semibold text-brand-700 underline dark:text-brand-400">Cookie Policy</Link>.</p>
      <H2>Your choices</H2>
      <p>You can sign out at any time to remove the token from your device. To ask for your data to be deleted, <Link to="/contact" className="font-semibold text-brand-700 underline dark:text-brand-400">contact us</Link>.</p>
    </Page>
  )
}

export function Terms() {
  useDocumentTitle('Terms of Use')
  return (
    <Page eyebrow="Legal" title="Terms of Use" intro="By using EV Times you agree to these terms.">
      <H2>Content</H2>
      <p>Articles written by EV Times are provided for information only and are not financial or purchasing advice. Some stories are headlines and short summaries from other publishers; each links to the original source, which remains the property of its owner.</p>
      <H2>Accounts</H2>
      <p>You are responsible for keeping your password secure and for activity under your account. We may suspend accounts that misuse the service.</p>
      <H2>Acceptable use</H2>
      <p>Do not attempt to disrupt the service, scrape it at a harmful rate or access areas you are not authorised to use.</p>
      <H2>Changes</H2>
      <p>We may update these terms from time to time. Continued use means you accept the updated terms.</p>
    </Page>
  )
}

export function Cookies() {
  useDocumentTitle('Cookie Policy')
  return (
    <Page eyebrow="Legal" title="Cookie Policy" intro="What is stored in your browser.">
      <p>EV Times uses your browser&apos;s local storage for essentials only: your sign-in token (when you log in) and your light or dark theme choice. We do not use advertising or cross-site tracking cookies.</p>
      <p>You can clear this data at any time from your browser settings; you will simply be signed out.</p>
    </Page>
  )
}

export function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <div className="py-24 text-center">
      <p className="font-headline text-8xl font-extrabold text-brand-500">404</p>
      <h1 className="mt-4 text-3xl font-bold">This page is out of charge</h1>
      <p className="mt-2 text-neutral-500">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white dark:bg-brand-500 dark:text-ink">Back to home</Link>
    </div>
  )
}
