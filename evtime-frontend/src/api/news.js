import client from './client'

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))

export const getNews = (params) => client.get('/news', { params: clean(params) }).then((r) => r.data)
export const getNewsById = (id) => client.get(`/news/${id}`).then((r) => r.data)
export const getFeatured = () => client.get('/news/featured').then((r) => r.data)
export const getTrending = () => client.get('/news/trending').then((r) => r.data)
export const getCategories = () => client.get('/news/categories').then((r) => r.data)
export const getRelated = (id) => client.get(`/news/${id}/related`).then((r) => r.data)
export const createNews = (body) => client.post('/news', body).then((r) => r.data)
export const updateNews = (id, body) => client.put(`/news/${id}`, body).then((r) => r.data)
export const deleteNews = (id) => client.delete(`/news/${id}`)
export const uploadImage = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/uploads', form).then((r) => r.data)
}

export const getBookmarks = () => client.get('/bookmarks').then((r) => r.data)
export const getBookmarkIds = () => client.get('/bookmarks/ids').then((r) => r.data)
export const addBookmark = (id) => client.post(`/bookmarks/${id}`)
export const removeBookmark = (id) => client.delete(`/bookmarks/${id}`)
