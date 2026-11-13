import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { Bookmark, ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Search, Sun, User, X, Zap } from 'lucide-react'
import { getCategories, getNews } from '../api/news'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { categoryPath, formatDate } from '../utils/format'
import Footer from './Footer'
import { BackToTop, ScrollManager } from './ScrollManager'
import ChatWidget from './ChatWidget'

function Ticker() {
  // refreshed every minute (paused while the tab is hidden) so headlines stay current
  const { data } = useQuery({
    queryKey: ['ticker'],
    queryFn: () => getNews({ page: 0, size: 10, sortBy: 'createdAt', direction: 'desc' }),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: 'always',
  })
  const items = data?.content ?? []
  if (!items.length) return null
  const loop = [...items, ...items]
  return (
    <div className="flex items-center overflow-hidden bg-ink text-white" aria-label="Latest headlines">
      <span className="z-10 flex shrink-0 items-center gap-1.5 bg-brand-500 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-ink">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
        </span>
        Live
      </span>
      <div className="ticker-mask relative flex-1 overflow-hidden">
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

function AccountMenu() {
  const { user, isStaff, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)


  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800'

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-1 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold uppercase text-white">{(user.name || user.email || '?').charAt(0)}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          initial={{ opacity: 0, scale: 0.92, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
          <Link role="menuitem" to="/profile" className={item} onClick={() => setOpen(false)}><User className="h-4 w-4" /> Profile</Link>
          <Link role="menuitem" to="/bookmarks" className={item} onClick={() => setOpen(false)}><Bookmark className="h-4 w-4" /> Bookmarks</Link>
          {isStaff && <Link role="menuitem" to="/admin" className={item} onClick={() => setOpen(false)}><LayoutDashboard className="h-4 w-4" /> Admin dashboard</Link>}
          <button role="menuitem" onClick={() => { setOpen(false); logout() }} className={`${item} border-t border-neutral-200 dark:border-neutral-800`}><LogOut className="h-4 w-4" /> Sign out</button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const { isAuthenticated, isStaff, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 300000 })

  const submit = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    setOpen(false)
  }

  const linkCls = ({ isActive }) =>
    `relative whitespace-nowrap px-1 py-3 text-sm font-semibold transition-colors ${
      isActive ? 'text-brand-700 dark:text-brand-400' : 'hover:text-brand-700 dark:hover:text-brand-400'
    }`
  const navItem = (to, label, props = {}) => (
    <NavLink key={to} to={to} className={linkCls} {...props}>
      {({ isActive }) => (
        <>
          {label}
          {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-0 bottom-0 h-0.5 rounded bg-brand-500" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
        </>
      )}
    </NavLink>
  )
  const iconBtn = 'rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800'

  return (
    <header className={`sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur transition-shadow duration-300 dark:border-neutral-800 dark:bg-neutral-950/95 ${scrolled ? 'shadow-md' : ''}`}>
      <Ticker />
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 ${scrolled ? 'py-1.5' : 'py-3'}`}>
        <button className={`${iconBtn} lg:hidden`} onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="hidden text-xs text-neutral-500 lg:block">{formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <Link to="/" className={`flex origin-center items-center gap-2 transition-transform duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`} aria-label="EV Times home">
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? 'sun' : 'moon'}
                className="flex"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
          {isAuthenticated ? (
            <AccountMenu />
          ) : (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Link to="/login" className="rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800">Sign in</Link>
              <Link to="/signup" className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-brand-500 dark:text-ink dark:hover:bg-brand-400">Subscribe</Link>
            </div>
          )}
        </div>
      </div>

      <nav className="hidden border-t border-neutral-200 lg:block dark:border-neutral-800" aria-label="Categories">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4">
          {navItem('/', 'Home', { end: true })}
          {categories.map((c) => navItem(categoryPath(c), c))}
          {navItem('/about', 'About')}
        </div>
      </nav>

      <AnimatePresence>
      {open && (
        <motion.nav
          className="overflow-hidden border-t border-neutral-200 lg:hidden dark:border-neutral-800"
          aria-label="Mobile"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="space-y-1 px-4 py-4">
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
                <button onClick={() => { logout(); setOpen(false) }} className="rounded-full border px-3 py-1.5 text-sm">Sign out</button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} to="/login" className="rounded-full border px-4 py-1.5 text-sm">Sign in</Link>
                <Link onClick={() => setOpen(false)} to="/signup" className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white">Subscribe</Link>
              </>
            )}
          </div>
          </div>
        </motion.nav>
      )}
      </AnimatePresence>
    </header>
  )
}

/** Fades/slides each new page in. Keyed by path so category and article changes animate too. */
function PageTransition() {
  const { pathname } = useLocation()
  return (
    <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      <Outlet />
    </motion.div>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-brand-500 focus:px-4 focus:py-2">Skip to content</a>
      <ScrollManager />
      <Header />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <PageTransition />
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget />
    </div>
  )
}
