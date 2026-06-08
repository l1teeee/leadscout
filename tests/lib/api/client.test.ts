import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  getToken: vi.fn(() => null),
  clearToken: vi.fn(),
}))
vi.mock('@/lib/env', () => ({
  env: { apiUrl: 'http://localhost:8000' },
}))

describe('apiFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Reset location to a neutral value before each test
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
      configurable: true,
    })
  })

  it('retorna JSON para respuesta ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
      clone: () => ({ json: () => Promise.resolve({}) }),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    const result = await apiFetch('/api/test')
    expect(result).toEqual({ data: 'test' })
  })

  it('lanza AppError para respuesta no-ok (400)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      clone: () => ({ json: () => Promise.resolve({ detail: 'bad request' }) }),
      json: () => Promise.resolve({ detail: 'bad request' }),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    const { AppError } = await import('@/lib/api/errors')
    await expect(apiFetch('/api/test')).rejects.toThrow(AppError)
  })

  it('lanza AppError con el mensaje del detail', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      clone: () => ({ json: () => Promise.resolve({ detail: 'validation error' }) }),
      json: () => Promise.resolve({ detail: 'validation error' }),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    await expect(apiFetch('/api/test')).rejects.toThrow('validation error')
  })

  it('401 en endpoint protegido redirige a /login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      clone: () => ({ json: () => Promise.resolve({}) }),
      json: () => Promise.resolve({}),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    try { await apiFetch('/api/leads') } catch { /* expected */ }
    expect(window.location.href).toBe('/login')
  })

  it('401 en /api/auth/login NO redirige a /login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      clone: () => ({ json: () => Promise.resolve({}) }),
      json: () => Promise.resolve({}),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    const { AppError } = await import('@/lib/api/errors')
    await expect(apiFetch('/api/auth/login')).rejects.toThrow(AppError)
    expect(window.location.href).not.toBe('/login')
  })

  it('401 en /api/auth/register NO redirige a /login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      clone: () => ({ json: () => Promise.resolve({}) }),
      json: () => Promise.resolve({}),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    const { AppError } = await import('@/lib/api/errors')
    await expect(apiFetch('/api/auth/register')).rejects.toThrow(AppError)
    expect(window.location.href).not.toBe('/login')
  })

  it('incluye Authorization header cuando getToken retorna un token', async () => {
    const { getToken } = await import('@/lib/auth')
    vi.mocked(getToken).mockReturnValue('my-token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      clone: () => ({ json: () => Promise.resolve({}) }),
    } as unknown as Response)

    const { apiFetch } = await import('@/lib/api/client')
    await apiFetch('/api/test')

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const headers = (fetchCall[1] as RequestInit).headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-token')
  })
})
