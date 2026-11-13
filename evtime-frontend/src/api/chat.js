import client from './client'

/**
 * Sends the (already trimmed) conversation and returns
 * { reply, sources: [{ id, title, sourceName }], mode: 'ai' | 'basic' }.
 */
export const sendChat = (messages) =>
  client.post('/chat', { messages }, { timeout: 60000 }).then((r) => r.data)
