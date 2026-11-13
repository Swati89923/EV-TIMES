import client from './client'

export const subscribeNewsletter = (email) =>
  client.post('/newsletter/subscribe', { email }).then((r) => r.data)

export const sendContact = (payload) =>
  client.post('/contact', payload).then((r) => r.data)
