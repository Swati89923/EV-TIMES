import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getBookmarks } from '../api/news'
import ArticleCard from '../components/ArticleCard'
import { Avatar, CardSkeleton, EmptyState, ErrorState } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import useDocumentTitle from '../hooks/useDocumentTitle'

export function Bookmarks() {
  useDocumentTitle('Bookmarks')
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['bookmarks', 'list'], queryFn: getBookmarks })

  return (
    <div>
      <h1 className="mb-6 border-b-2 border-ink pb-3 text-4xl font-extrabold dark:border-neutral-200">Your Bookmarks</h1>
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <CardSkeleton key={i} />)}</div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data.length === 0 ? (
        <EmptyState title="No saved stories" message="Tap the Save button on any article to read it later.">
          <Link to="/" className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Browse latest news</Link>
        </EmptyState>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((n) => <ArticleCard key={n.id} news={n} />)}</div>
      )}
    </div>
  )
}

export function Profile() {
  useDocumentTitle('Profile')
  const { user, logout, isStaff } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 p-8 dark:border-neutral-800">
      <div className="flex items-center gap-4">
        <Avatar user={user} className="h-16 w-16 text-2xl" />
        <div>
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
      </div>
      <dl className="mt-6 divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
        <div className="flex justify-between py-3"><dt className="text-neutral-500">Role</dt><dd className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-700">{user.role}</dd></div>
        <div className="flex justify-between py-3"><dt className="text-neutral-500">Email</dt><dd>{user.email}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/bookmarks" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700">My bookmarks</Link>
        {isStaff && <Link to="/admin" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700">Admin dashboard</Link>}
        <button onClick={() => { logout(); navigate('/') }} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Log out</button>
      </div>
    </div>
  )
}
