import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import { CategoryPage, SearchPage } from './pages/NewsList'
import Article from './pages/Article'
import { Login, Signup } from './pages/Auth'
import { Bookmarks, Profile } from './pages/Account'
import { About, NotFound } from './pages/Static'
import { Skeleton } from './components/ui'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ArticleForm = lazy(() => import('./pages/admin/ArticleForm'))

export default function App() {
  return (
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
  )
}
