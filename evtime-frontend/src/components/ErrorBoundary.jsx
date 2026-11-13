import { Component } from 'react'

/** Catches render errors so a broken page shows a friendly message instead of a blank screen. */
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center" role="alert">
        <p className="font-headline text-6xl font-extrabold text-brand-500">Oops</p>
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-neutral-500">An unexpected error occurred while showing this page. Reloading usually fixes it.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => window.location.reload()} className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white dark:bg-brand-500 dark:text-ink">Reload page</button>
          <a href="/" className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-semibold dark:border-neutral-700">Go to home</a>
        </div>
      </div>
    )
  }
}
