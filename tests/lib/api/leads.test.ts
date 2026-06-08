import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({
  getToken: vi.fn(() => null),
  clearToken: vi.fn(),
  setToken: vi.fn(),
}))

import { getLeads, markLeadViewed, updateLead } from '@/lib/api/leads'
import { apiFetch } from '@/lib/api/client'

const mockApiFetch = vi.mocked(apiFetch)

const makeApiLead = (overrides = {}) => ({
  id: '1',
  workspace_id: 'ws',
  name: 'Test',
  category: 'Servicios',
  location: 'SV',
  address: null,
  latitude: null,
  longitude: null,
  score: 50,
  status: 'nuevo',
  priority: 'media',
  issues: [],
  phone: null,
  website: null,
  google_place_id: null,
  source: 'manual',
  last_contact: null,
  ai_analysis: null,
  is_viewed: false,
  created_at: null,
  updated_at: null,
  ...overrides,
})

describe('getLeads', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('mapea is_viewed correctamente cuando es true', async () => {
    mockApiFetch.mockResolvedValue({
      data: [makeApiLead({ is_viewed: true })],
      total: 1,
    })
    const { leads } = await getLeads()
    expect(leads[0].is_viewed).toBe(true)
  })

  it('mapea is_viewed correctamente cuando es false', async () => {
    mockApiFetch.mockResolvedValue({
      data: [makeApiLead({ is_viewed: false })],
      total: 1,
    })
    const { leads } = await getLeads()
    expect(leads[0].is_viewed).toBe(false)
  })

  it('mapea lastContact desde last_contact', async () => {
    mockApiFetch.mockResolvedValue({
      data: [makeApiLead({ last_contact: '2025-01-15' })],
      total: 1,
    })
    const { leads } = await getLeads()
    expect(leads[0].lastContact).toBe('2025-01-15')
  })

  it('lastContact es undefined cuando last_contact es null', async () => {
    mockApiFetch.mockResolvedValue({
      data: [makeApiLead({ last_contact: null })],
      total: 1,
    })
    const { leads } = await getLeads()
    expect(leads[0].lastContact).toBeUndefined()
  })

  it('construye query string con filtros status y priority', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 0 })
    await getLeads({ status: 'nuevo', priority: 'alta', limit: 10, offset: 0 })
    const callArgs = mockApiFetch.mock.calls[0][0] as string
    expect(callArgs).toContain('status=nuevo')
    expect(callArgs).toContain('priority=alta')
    expect(callArgs).toContain('limit=10')
    expect(callArgs).toContain('offset=0')
  })

  it('no incluye parametros vacios en query string', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 0 })
    await getLeads({})
    const callArgs = mockApiFetch.mock.calls[0][0] as string
    expect(callArgs).toBe('/api/leads')
  })

  it('clampea limit a MAX_LEADS_LIMIT', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 0 })
    await getLeads({ limit: 9999 })
    const callArgs = mockApiFetch.mock.calls[0][0] as string
    expect(callArgs).toContain('limit=200')
  })

  it('retorna total del response', async () => {
    mockApiFetch.mockResolvedValue({ data: [], total: 42 })
    const { total } = await getLeads()
    expect(total).toBe(42)
  })
})

describe('markLeadViewed', () => {
  it('hace PATCH con is_viewed: true', async () => {
    mockApiFetch.mockResolvedValue(undefined)
    await markLeadViewed('lead-123')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/leads/lead-123',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ is_viewed: true }),
      })
    )
  })
})

describe('updateLead', () => {
  it('hace PATCH con el payload dado', async () => {
    mockApiFetch.mockResolvedValue(undefined)
    await updateLead('lead-456', { status: 'contactado' })
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/leads/lead-456',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'contactado' }),
      })
    )
  })
})
