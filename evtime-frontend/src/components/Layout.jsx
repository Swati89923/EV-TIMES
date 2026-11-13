import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Bookmark, LayoutDashboard, LogOut, Menu, Moon, Search, Sun, User, X, Zap } from 'lucide-react'
import { getCategories, getNews } from '../api/news'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { categoryPath, formatDate } from '../utils/format'

function Ticker() {
  const { data } = useQuery({ queryKey: ['ticker'], queryFn: () => getNews({ page: 0, size: 8, sortBy: 'createdAt', direction: 'desc' }), staleTime: 60000 })
  const items = data?.content ?? []
  if (!items.length) return null
  const loop = [...items, ...items]
  return (
    <div className="flex items-center overflow-hidden bg-ink text-white" aria-label="Breaking news">
      <span className="z-10 flex shrink-0 items-center gap-1 bg-brand-500 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-ink">
        <Zap className="h-3.5 w-3.5" /> Latest
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track flex w-max gap-10 whitespace-nowrap py-2 pl-6 text-sm">
          {loop.map((n, i) => (
            <Link key={`${n.id}-${i}`} to={`/news/${n.id}`} className="hover:text-brand-400" tabIndex={i >= items.length ? -1 : 0}>
              {n.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const { isAuthenticated, isStaff, user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 300000 })

  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    setOpen(false)
  }

  const linkCls = ({ isActive }) =>
    `whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold transition ${
      isActive ? 'border-brand-500 text-brand-700 dark:text-brand-400' : 'border-transparent hover:border-neutral-400'
    }`
  const iconBtn = 'rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800'

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <Ticker />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <button className={`${iconBtn} lg:hidden`} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="hidden text-xs text-neutral-500 lg:block">{formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <Link to="/" className="flex items-center gap-2" aria-label="EV Times home">
          <Zap className="h-6 w-6 fill-brand-500 text-brand-500" />
          <span className="font-headline text-2xl font-extrabold tracking-tight md:text-3xl">
            EV <span className="text-brand-600 dark:text-brand-400">TIMES</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <form onSubmit={submit} className="hidden md:block" role="search">
            <label htmlFor="site-search" className="sr-only">Search articles</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input id="site-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-40 rounded-full border border-neutral-300 bg-transparent py-1.5 pl-9 pr-3 text-sm outline-none focus:w-56 focus:border-brand-500 dark:border-neutral-700" style={{ transition: 'width .2s' }} />
            </div>
          </form>
          <button className={iconBtn} onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {isAuthenticated ? (
            <div className="hidden items-center gap-1 lg:flex">
              {isStaff && <Link to="/admin" className={iconBtn} aria-label="Admin dashboard"><LayoutDashboard className="h-5 w-5" /></Link>}
              <Link to="/bookmarks" className={iconBtn} aria-label="Bookmarks"><Bookmark className="h-5 w-5" /></Link>
              <Link to="/profile" className={iconBtn} aria-label={`Profile of ${user.name}`}><User className="h-5 w-5" /></Link>
              <button className={iconBtn} onClick={logout} aria-label="Log out"><LogOut className="h-5 w-5" /></button>
            </div>
          ) : (
            <Link to="/login" className="ml-1 hidden rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 sm:block dark:bg-brand-500 dark:text-ink dark:hover:bg-brand-400">
              Sign in
            </Link>
          )}
        </div>
      </div>

      <nav className="hidden border-t border-neutral-200 lg:block dark:border-neutral-800" aria-label="Categories">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          {categories.map((c) => (
            <NavLink key={c} to={categoryPath(c)} className={linkCls}>{c}</NavLink>
          ))}
          <NavLink to="/about" className={linkCls}>About</NavLink>
        </div>
      </nav>

      {open && (
        <nav className="space-y-1 border-t border-neutral-200 px-4 py-4 lg:hidden dark:border-neutral-800" aria-label="Mobile">
          <form onSubmit={submit} className="mb-3" role="search">
            <label htmlFor="m-search" className="sr-only">Search articles</label>
            <input id="m-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search news..." className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700" />
          </form>
          {[['/', 'Home'], ...categories.map((c) => [categoryPath(c), c]), ['/about', 'About']].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className="block rounded px-2 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800">{label}</NavLink>
          ))}
          <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            {isAuthenticated ? (
              <>
                {isStaff && <Link onClick={() => setOpen(false)} to="/admin" className="rounded-full border px-3 py-1.5 text-sm">Admin</Link>}
                <Link onClick={() => setOpen(false)} to="/bookmarks" className="rounded-full border px-3 py-1.5 text-sm">Bookmarks</Link>
                <Link onClick={() => setOpen(false)} to="/profile" className="rounded-full border px-3 py-1.5 text-sm">Profile</Link>
                <button onClick={() => { logout(); setOpen(false) }} className="rounded-full border px-3 py-1.5 text-sm">Log out</button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} to="/login" className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white">Sign in</Link>
                <Link onClick={() => setOpen(false)} to="/signup" className="rounded-full border px-4 py-1.5 text-sm">Create account</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 300000 })
  return (
    <footer className="mt-16 bg-ink text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-headline text-2xl font-extrabold text-white">EV <span className="text-brand-400">TIMES</span></p>
          <p className="mt-3 max-w-sm text-sm">Independent reporting and analysis on electric vehicles, batteries, charging infrastructure, policy and the markets that move them.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Sections</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c}><Link className="hover:text-brand-400" to={categoryPath(c)}>{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-brand-400" to="/about">About us</Link></li>
            <li><Link className="hover:text-brand-400" to="/login">Sign in</Link></li>
            <li><Link className="hover:text-brand-400" to="/signup">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} EV Times. All rights reserved.
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-brand-500 focus:px-4 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
