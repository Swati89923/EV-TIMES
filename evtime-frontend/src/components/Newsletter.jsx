import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const toast = useToast()

  const submit = (e) => {
    e.preventDefault()
    toast('Thanks for subscribing! Check your inbox soon.')
    setEmail('')
  }

  return (
    <section className="rounded-xl bg-ink px-6 py-10 text-white md:px-12" aria-labelledby="newsletter-title">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:text-left">
        <Mail className="h-12 w-12 shrink-0 text-brand-400" />
        <div className="flex-1">
          <h2 id="newsletter-title" className="text-2xl font-bold">The EV Times Daily</h2>
          <p className="mt-1 text-sm text-neutral-300">The day&apos;s most important electric vehicle stories, in your inbox every morning.</p>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-sm gap-2">
          <label htmlFor="nl-email" className="sr-only">Email address</label>
          <input
            id="nl-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 rounded-md bg-white/10 px-3 py-2.5 text-sm placeholder:text-neutral-400 outline-none ring-1 ring-white/20 focus:ring-brand-400"
          />
          <button className="rounded-md bg-brand-500 px-4 text-sm font-semibold text-ink hover:bg-brand-400">Subscribe</button>
        </form>
      </div>
    </section>
  )
}
