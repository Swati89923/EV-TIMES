import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { deleteNews, getNews } from '../../api/news'
import { errorMessage } from '../../api/client'
import { EmptyState, ErrorState, Modal, Pagination, Skeleton, SmartImage, inputCls } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { formatDate } from '../../utils/format'

export default function AdminDashboard() {
  useDocumentTitle('Admin dashboard')
  const [page, setPage] = useState(0)
  const [input, setInput] = useState('')
  const [q, setQ] = useState('')
  const [target, setTarget] = useState(null)
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['news', 'admin', q, page],
    queryFn: () => getNews({ q, page, size: 10, sortBy: 'createdAt', direction: 'desc' }),
    placeholderData: (prev) => prev,
  })

  const remove = useMutation({
    mutationFn: (id) => deleteNews(id),
    onSuccess: () => {
      toast('Article deleted')
      setTarget(null)
      qc.invalidateQueries({ queryKey: ['news'] })
      qc.invalidateQueries({ queryKey: ['featured'] })
      qc.invalidateQueries({ queryKey: ['trending'] })
    },
    onError: (e) => toast(errorMessage(e), 'error'),
  })

  const search = (e) => {
    e.preventDefault()
    setPage(0)
    setQ(input.trim())
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3 dark:border-neutral-200">
        <h1 className="text-3xl font-extrabold">Newsroom dashboard</h1>
        <Link to="/admin/news/new" className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> New article
        </Link>
      </div>

      <form onSubmit={search} className="mb-5 flex max-w-md gap-2" role="search">
        <label htmlFor="admin-q" className="sr-only">Search articles</label>
        <input id="admin-q" className={inputCls} placeholder="Search by title..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="rounded-md border border-neutral-300 px-3 dark:border-neutral-700" aria-label="Search"><Search className="h-4 w-4" /></button>
      </form>

      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : data.content.length === 0 ? (
        <EmptyState title="No articles" message={q ? 'No article matches your search.' : 'Create your first article to get started.'} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500 dark:bg-neutral-900">
              <tr>
                <th className="px-4 py-3">Article</th>
                <th className="hidden px-4 py-3 md:table-cell">Category</th>
                <th className="hidden px-4 py-3 md:table-cell">Author</th>
                <th className="hidden px-4 py-3 lg:table-cell">Published</th>
                <th className="hidden px-4 py-3 lg:table-cell">Views</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {data.content.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SmartImage src={n.imageUrl} alt="" className="hidden h-12 w-16 rounded sm:block" />
                      <div>
                        <Link to={`/news/${n.id}`} className="font-semibold hover:underline">{n.title}</Link>
                        {n.featured && <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-700">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{n.category}</td>
                  <td className="hidden px-4 py-3 md:table-cell">{n.author}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">{formatDate(n.createdAt)}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">{n.views ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/admin/news/${n.id}/edit`} aria-label={`Edit ${n.title}`} className="rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"><Edit3 className="h-4 w-4" /></Link>
                      <button onClick={() => setTarget(n)} aria-label={`Delete ${n.title}`} className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />}

      <Modal open={!!target} title="Delete article?" onClose={() => setTarget(null)}>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          &ldquo;{target?.title}&rdquo; will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setTarget(null)} className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700">Cancel</button>
          <button disabled={remove.isPending} onClick={() => remove.mutate(target.id)} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {remove.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
