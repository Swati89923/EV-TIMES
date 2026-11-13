import client from './client'

export const signup = (body) => client.post('/auth/signup', body).then((r) => r.data)
export const login = (body) => client.post('/auth/login', body).then((r) => r.data)
