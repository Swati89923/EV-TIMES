import { Bookmark } from 'lucide-react'
import { motion } from 'motion/react'
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
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={click}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        saved ? 'border-brand-600 bg-brand-600 text-white' : 'border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
      }`}
    >
      <motion.span key={saved ? 'saved' : 'unsaved'} className="inline-flex" initial={{ scale: saved ? 0.4 : 1, rotate: saved ? -20 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
        <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      </motion.span>
      {saved ? 'Saved' : 'Save'}
    </motion.button>
  )
}
