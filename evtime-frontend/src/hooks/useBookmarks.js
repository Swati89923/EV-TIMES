import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addBookmark, getBookmarkIds, removeBookmark } from '../api/news'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../api/client'

export default function useBookmarks() {
  const { isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const toast = useToast()

  const { data: ids = [] } = useQuery({
    queryKey: ['bookmarks', 'ids'],
    queryFn: getBookmarkIds,
    enabled: isAuthenticated,
  })

  const mutation = useMutation({
    mutationFn: ({ id, saved }) => (saved ? removeBookmark(id) : addBookmark(id)),
    onSuccess: (_, { saved }) => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] })
      toast(saved ? 'Removed from bookmarks' : 'Saved to bookmarks')
    },
    onError: (e) => toast(errorMessage(e), 'error'),
  })

  return {
    isSaved: (id) => ids.includes(id),
    toggle: (id) => mutation.mutate({ id, saved: ids.includes(id) }),
    pending: mutation.isPending,
  }
}
