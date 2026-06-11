import { describe, it, expect, beforeEach } from 'vitest'
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  setToken,
  getToken,
  clearToken,
  parseTokenUser,
  setUserSignature,
  getUserSignature,
} from '@/lib/auth'

function captureCookieWrites(action: () => void): string[] {
  const ownDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie')
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
  const descriptor = ownDescriptor ?? prototypeDescriptor
  const writes: string[] = []

  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get() {
      return descriptor?.get?.call(document) ?? ''
    },
    set(value: string) {
      writes.push(value)
      descriptor?.set?.call(document, value)
    },
  })

  action()

  if (ownDescriptor) {
    Object.defineProperty(document, 'cookie', ownDescriptor)
  } else {
    delete (document as Document & { cookie?: string }).cookie
  }

  return writes
}

describe('auth token management', () => {
  beforeEach(() => {
    document.cookie = 'ls_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    sessionStorage.clear()
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

  it('setToken crea una cookie persistente de 7 dias', () => {
    const [cookieWrite] = captureCookieWrites(() => setToken('my-test-token'))

    expect(cookieWrite).toContain(`${SESSION_COOKIE_NAME}=my-test-token`)
    expect(cookieWrite).toContain(`max-age=${SESSION_MAX_AGE_SECONDS}`)
    expect(cookieWrite).toContain('expires=')
    expect(cookieWrite).toContain('path=/')
    expect(cookieWrite).toContain('SameSite=Strict')
  })

  it('clearToken elimina el token de la cookie', () => {
    setToken('my-test-token')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('clearToken expira la cookie y limpia la firma de sesion', () => {
    setToken('my-test-token')
    setUserSignature('signed-user')

    const [cookieWrite] = captureCookieWrites(() => clearToken())

    expect(cookieWrite).toContain(`${SESSION_COOKIE_NAME}=`)
    expect(cookieWrite).toContain('max-age=0')
    expect(cookieWrite).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT')
    expect(getUserSignature()).toBeNull()
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
