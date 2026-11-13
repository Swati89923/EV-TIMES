import { Bookmark } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useBookmarks from '../hooks/useBookmarks'
import { useAuth } from '../context/AuthContext'

export default function BookmarkButton({ id }) {
  const { isAuthenticated } = useAuth()
  const { isSaved, toggle, pending } = useBookmarks()
  const navigate = useNavigate()
  const saved = isSaved(id)

  const click = () => (isAuthenticated ? toggle(id) : navigate('/login', { state: { from: `/news/${id}` } }))

  return (
    <button
      onClick={click}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        saved ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
