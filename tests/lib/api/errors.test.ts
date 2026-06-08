import { describe, it, expect } from 'vitest'
import { parseApiError, AppError } from '@/lib/api/errors'

describe('parseApiError', () => {
  it('retorna el string directamente si el error es string', () => {
    expect(parseApiError('algo salió mal')).toBe('algo salió mal')
  })

  it('retorna message de AppError', () => {
    const err = new AppError('mensaje específico', 400)
    expect(parseApiError(err)).toBe('mensaje específico')
  })

  it('retorna message de Error estándar', () => {
    expect(parseApiError(new Error('error estándar'))).toBe('error estándar')
  })

  it('retorna fallback para objeto con propiedad detail (no es string ni Error)', () => {
    const result = parseApiError({ detail: 'error del servidor' })
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('retorna fallback para objeto sin detail', () => {
    const result = parseApiError({ code: 500 })
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('retorna fallback para null', () => {
    const result = parseApiError(null)
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('retorna fallback para undefined', () => {
    const result = parseApiError(undefined)
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('AppError', () => {
  it('preserva status y message', () => {
    const err = new AppError('not found', 404)
    expect(err.message).toBe('not found')
    expect(err.status).toBe(404)
  })

  it('es instancia de Error', () => {
    expect(new AppError('x', 400)).toBeInstanceOf(Error)
  })

  it('tiene name AppError', () => {
    expect(new AppError('x', 400).name).toBe('AppError')
  })
})
