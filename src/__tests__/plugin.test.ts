import { describe, it, expect, vi } from 'vitest'
import { IpLookupPlugin } from '../plugin.js'
import type { IpLookupProvider } from '../types.js'

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')
  const mockAxiosInstance = {
    get: vi.fn((url: string) => {
      if (url === '/fail-url') {
        return Promise.reject(new Error('parse failed'))
      }
      if (url === '/axios-error') {
        const axErr = new actual.AxiosError('Request failed', undefined, undefined, undefined, {
          status: 503,
          data: {},
          statusText: 'Service Unavailable',
          headers: {},
          config: { headers: {} } as never,
        })
        return Promise.reject(axErr)
      }
      if (url === '/unknown-error') {
        return Promise.reject('non-error-string')
      }
      return Promise.resolve({ data: { ip: '8.8.8.8', country: 'Mock' } })
    }),
  }
  return { ...actual, default: { ...actual.default, create: vi.fn(() => mockAxiosInstance) } }
})

// Also mock error.ts
vi.mock('../error.js', () => ({
  AxiosError: class AxiosError extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AxiosError'
    }
  },
}))

const mockProvider: IpLookupProvider = {
  name: 'mock-success',
  modes: ['self', 'ip'],
  responseType: 'json',
  buildUrl: () => '/mock-url',
  parse: (raw: unknown) => ({
    ip: (raw as Record<string, unknown>).ip as string,
    country: 'Mock Country',
    provider: 'mock-success',
    raw,
  }),
}

const mockFailingProvider: IpLookupProvider = {
  name: 'mock-fail',
  modes: ['self', 'ip'],
  responseType: 'json',
  buildUrl: () => '/fail-url',
  parse: () => {
    throw new Error('parse failed')
  },
}

const mockSelfOnly: IpLookupProvider = {
  name: 'mock-self',
  modes: ['self'],
  responseType: 'json',
  buildUrl: () => '/self-url',
  parse: (raw) => ({ ip: '127.0.0.1', provider: 'mock-self', raw }),
}

const mockTextProvider: IpLookupProvider = {
  name: 'mock-text',
  modes: ['self'],
  responseType: 'text',
  buildUrl: () => '/text-url',
  parse: (raw) => ({ ip: String(raw), provider: 'mock-text', raw }),
}

const mockAxiosErrorProvider: IpLookupProvider = {
  name: 'mock-axios-error',
  modes: ['self'],
  responseType: 'json',
  buildUrl: () => '/axios-error',
  parse: () => ({ ip: '', provider: 'mock-axios-error', raw: null }),
}

const mockUnknownErrorProvider: IpLookupProvider = {
  name: 'mock-unknown-error',
  modes: ['self'],
  responseType: 'json',
  buildUrl: () => '/unknown-error',
  parse: () => ({ ip: '', provider: 'mock-unknown-error', raw: null }),
}

describe('IpLookupPlugin', () => {
  it('creates instance', () => {
    expect(new IpLookupPlugin()).toBeInstanceOf(IpLookupPlugin)
  })

  it('lookupSelf succeeds', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockProvider] })
    const result = await plugin.lookupSelf()
    expect(result.provider).toBe('mock-success')
  })

  it('lookupIp succeeds', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockProvider] })
    const result = await plugin.lookupIp('8.8.8.8')
    expect(result.ip).toBe('8.8.8.8')
  })

  it('fails when parse throws', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockFailingProvider] })
    await expect(plugin.lookupSelf()).rejects.toThrow()
  })

  it('filters providers by mode', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockSelfOnly, mockProvider] })
    const result = await plugin.lookupIp('1.2.3.4')
    expect(result.provider).toBe('mock-success')
  })

  it('throws IpLookupError when all fail', async () => {
    const plugin = new IpLookupPlugin({
      providers: [mockFailingProvider, { ...mockFailingProvider, name: 'fail-2' }],
    })
    await expect(plugin.lookupSelf()).rejects.toThrow('所有 IP 查询源均失败')
  })

  it('handles text responseType provider', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockTextProvider] })
    const result = await plugin.lookupSelf()
    expect(result.provider).toBe('mock-text')
  })

  it('rotates provider cursor across lookup calls', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockProvider, mockProvider] })
    await plugin.lookupSelf()
    const result = await plugin.lookupSelf()
    expect(result.provider).toBe('mock-success')
  })

  it('creates instance with custom startIndex', () => {
    const plugin = new IpLookupPlugin({ providers: [mockProvider], startIndex: 0 })
    expect(plugin).toBeInstanceOf(IpLookupPlugin)
  })

  it('reports AxiosError with HTTP status in reason', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockAxiosErrorProvider] })
    await expect(plugin.lookupSelf()).rejects.toThrow('所有 IP 查询源均失败')
  })

  it('reports unknown error values in reason', async () => {
    const plugin = new IpLookupPlugin({ providers: [mockUnknownErrorProvider] })
    await expect(plugin.lookupSelf()).rejects.toThrow('所有 IP 查询源均失败')
  })
})