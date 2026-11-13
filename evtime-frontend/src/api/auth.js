import client from './client'

export const signup = (body) => client.post('/auth/signup', body).then((r) => r.data)
export const login = (body) => client.post('/auth/login', body).then((r) => r.data)
export const googleLogin = (credential) => client.post('/auth/google', { credential }).then((r) => r.data)
export const getAuthConfig = () => client.get('/auth/config').then((r) => r.data)
