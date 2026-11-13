import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import { Skeleton } from './components/ui'

// Everything except the front page is loaded on demand to keep the first download small.
const named = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })))
const CategoryPage = named(() => import('./pages/NewsList'), 'CategoryPage')
const SearchPage = named(() => import('./pages/NewsList'), 'SearchPage')
const Article = lazy(() => import('./pages/Article'))
const Login = named(() => import('./pages/Auth'), 'Login')
const Signup = named(() => import('./pages/Auth'), 'Signup')
const Bookmarks = named(() => import('./pages/Account'), 'Bookmarks')
const Profile = named(() => import('./pages/Account'), 'Profile')
const About = named(() => import('./pages/Static'), 'About')
const Advertise = named(() => import('./pages/Static'), 'Advertise')
const Careers = named(() => import('./pages/Static'), 'Careers')
const Contact = named(() => import('./pages/Static'), 'Contact')
const Cookies = named(() => import('./pages/Static'), 'Cookies')
const NotFound = named(() => import('./pages/Static'), 'NotFound')
const Privacy = named(() => import('./pages/Static'), 'Privacy')
const Terms = named(() => import('./pages/Static'), 'Terms')

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm'))

export default function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<Skeleton className="m-8 h-64" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category/:name" element={<CategoryPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="news/:id" element={<Article />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="careers" element={<Careers />} />
          <Route path="advertise" element={<Advertise />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="cookies" element={<Cookies />} />
          <Route element={<ProtectedRoute />}>
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route element={<ProtectedRoute roles={['ADMIN', 'EDITOR']} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/news/new" element={<ArticleForm />} />
            <Route path="admin/news/:id/edit" element={<ArticleForm />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
