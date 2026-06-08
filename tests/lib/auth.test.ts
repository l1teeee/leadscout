import { describe, it, expect, beforeEach } from 'vitest'
import { setToken, getToken, clearToken, parseTokenUser } from '@/lib/auth'

describe('auth token management', () => {
  beforeEach(() => {
    document.cookie = 'ls_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  })

  it('setToken escribe el token en cookie ls_token', () => {
    setToken('my-test-token')
    expect(document.cookie).toContain('ls_token=')
    // getToken should round-trip correctly
    expect(getToken()).toBe('my-test-token')
  })

  it('getToken lee el token correctamente', () => {
    setToken('my-test-token')
    expect(getToken()).toBe('my-test-token')
  })

  it('clearToken elimina el token de la cookie', () => {
    setToken('my-test-token')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('getToken retorna null cuando no hay cookie', () => {
    expect(getToken()).toBeNull()
  })
})

describe('parseTokenUser', () => {
  it('extrae id y email de un JWT válido', () => {
    // btoa produces standard base64 which atob can decode directly
    const payload = btoa(JSON.stringify({ sub: 'user-123', email: 'test@test.com' }))
    const fakeJwt = `header.${payload}.signature`
    const user = parseTokenUser(fakeJwt)
    expect(user).not.toBeNull()
    expect(user?.id).toBe('user-123')
    expect(user?.email).toBe('test@test.com')
  })

  it('retorna null para token sin 3 partes', () => {
    expect(parseTokenUser('invalid-token')).toBeNull()
  })

  it('retorna null para payload base64 inválido', () => {
    expect(parseTokenUser('h.!!!invalid!!!.s')).toBeNull()
  })
})
