import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Loader2 } from 'lucide-react'
import { createNews, getCategories, getNewsById, updateNews, uploadImage } from '../../api/news'
import { errorMessage } from '../../api/client'
import { ErrorState, Skeleton, SmartImage, inputCls } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const MAX_BYTES = 5 * 1024 * 1024
const BLANK = { title: 1, description: 1, content: 1, imageUrl: 1, category: 1, author: 1, featured: 1 }
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function Form({ initial, id }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const [form, setForm] = useState({
    title: '', description: '', content: '', imageUrl: '', category: '', author: user?.name ?? '', featured: false,
    ...Object.fromEntries(Object.entries(initial ?? {}).filter(([k, v]) => k in BLANK && v != null)),
  })
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = useMutation({
    mutationFn: (body) => (id ? updateNews(id, body) : createNews(body)),
    onSuccess: () => {
      toast(id ? 'Article updated' : 'Article published')
      qc.invalidateQueries({ queryKey: ['news'] })
      qc.invalidateQueries({ queryKey: ['featured'] })
      qc.invalidateQueries({ queryKey: ['trending'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['ticker'] })
      navigate('/admin')
    },
    onError: (e) => toast(errorMessage(e), 'error'),
  })

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!TYPES.includes(file.type)) return toast('Use a JPG, PNG, WEBP or GIF image', 'error')
    if (file.size > MAX_BYTES) return toast('Image must be 5MB or smaller', 'error')
    setUploading(true)
    try {
      const { imageUrl } = await uploadImage(file)
      setForm((f) => ({ ...f, imageUrl }))
      toast('Image uploaded')
    } catch (err) {
      toast(errorMessage(err, 'Upload failed'), 'error')
    } finally {
      setUploading(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const err = {}
    if (!form.title.trim()) err.title = 'Title is required'
    if (!form.description.trim()) err.description = 'Summary is required'
    if (!form.category.trim()) err.category = 'Category is required'
    setErrors(err)
    if (Object.keys(err).length) return
    save.mutate({ ...form, title: form.title.trim(), category: form.category.trim() })
  }

  const label = 'mb-1 block text-sm font-medium'
  const errText = (k) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div>
          <label htmlFor="title" className={label}>Headline</label>
          <input id="title" className={inputCls} value={form.title} onChange={set('title')} maxLength={200} />
          {errText('title')}
        </div>
        <div>
          <label htmlFor="description" className={label}>Summary</label>
          <textarea id="description" rows={3} className={inputCls} value={form.description} onChange={set('description')} maxLength={500} />
          {errText('description')}
        </div>
        <div>
          <label htmlFor="content" className={label}>Article body</label>
          <textarea id="content" rows={14} className={inputCls} value={form.content} onChange={set('content')} placeholder="Separate paragraphs with a blank line." />
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="category" className={label}>Category</label>
          <input id="category" list="cats" className={inputCls} value={form.category} onChange={set('category')} />
          <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          {errText('category')}
        </div>
        <div>
          <label htmlFor="author" className={label}>Author</label>
          <input id="author" className={inputCls} value={form.author} onChange={set('author')} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.featured} onChange={set('featured')} className="h-4 w-4 accent-brand-600" /> Feature on the front page
        </label>

        <div>
          <span className={label}>Cover image</span>
          <SmartImage key={form.imageUrl} src={form.imageUrl} alt="Cover preview" className="aspect-[16/10] w-full rounded-lg" />
          <div className="mt-2 flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept={TYPES.join(',')} className="sr-only" onChange={onFile} disabled={uploading} />
            </label>
          </div>
          <label htmlFor="imageUrl" className="mb-1 mt-3 block text-xs text-neutral-500">...or paste an image URL</label>
          <input id="imageUrl" className={inputCls} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://" />
        </div>

        <div className="flex gap-2 pt-2">
          <button disabled={save.isPending || uploading} className="flex-1 rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {save.isPending ? 'Saving...' : id ? 'Save changes' : 'Publish'}
          </button>
          <Link to="/admin" className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm dark:border-neutral-700">Cancel</Link>
        </div>
      </div>
    </form>
  )
}

export default function ArticleForm() {
  const { id } = useParams()
  useDocumentTitle(id ? 'Edit article' : 'New article')
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['news', 'edit', id], queryFn: () => getNewsById(id), enabled: !!id, gcTime: 0 })

  return (
    <div>
      <h1 className="mb-6 border-b-2 border-ink pb-3 text-3xl font-extrabold dark:border-neutral-200">{id ? 'Edit article' : 'New article'}</h1>
      {id && isLoading ? <Skeleton className="h-96" /> : id && isError ? <ErrorState onRetry={refetch} /> : <Form id={id} initial={data} />}
    </div>
  )
}
