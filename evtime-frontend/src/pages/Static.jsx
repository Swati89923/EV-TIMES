import { Link } from 'react-router-dom'
import { BatteryCharging, Globe2, ShieldCheck } from 'lucide-react'
import useDocumentTitle from '../hooks/useDocumentTitle'

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
        EV Times is a digital newsroom dedicated to electric mobility. We report on the technology, infrastructure, policy and business of the shift away from combustion, so readers can make sense of an industry that is changing every week.
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
