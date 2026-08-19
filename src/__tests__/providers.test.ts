import { describe, it, expect } from 'vitest'
import { defaultProviders } from '../providers'

describe('defaultProviders', () => {
  it('has 8 providers', () => {
    expect(defaultProviders.length).toBe(8)
  })

  it('each provider has required fields', () => {
    for (const p of defaultProviders) {
      expect(p.name).toBeTruthy()
      expect(p.modes.length).toBeGreaterThanOrEqual(1)
      expect(typeof p.buildUrl).toBe('function')
      expect(typeof p.parse).toBe('function')
    }
  })

  describe('provider URL builders', () => {
    it('ip-sb builds self and ip URLs', () => {
      const p = defaultProviders.find((x) => x.name === 'ip-sb')!
      expect(p.buildUrl({})).toBe('https://api.ip.sb/geoip/')
      expect(p.buildUrl({ ip: '1.2.3.4' })).toBe('https://api.ip.sb/geoip/1.2.3.4')
    })

    it('ipify builds self URL only', () => {
      const p = defaultProviders.find((x) => x.name === 'ipify')!
      expect(p.buildUrl({})).toBe('https://api.ipify.org?format=json')
    })

    it('cloudflare-trace has text response type', () => {
      const p = defaultProviders.find((x) => x.name === 'cloudflare-trace')!
      expect(p.responseType).toBe('text')
    })

    it('ipwhois builds self and ip URLs', () => {
      const p = defaultProviders.find((x) => x.name === 'ipwhois')!
      expect(p.buildUrl({})).toBe('https://ipwhois.app/json/?format=json')
      expect(p.buildUrl({ ip: '1.2.3.4' })).toBe('https://ipwhois.app/json/1.2.3.4?format=json')
    })

    it('freeipapi builds self and ip URLs', () => {
      const p = defaultProviders.find((x) => x.name === 'freeipapi')!
      expect(p.buildUrl({})).toBe('https://freeipapi.com/api/json')
      expect(p.buildUrl({ ip: '1.2.3.4' })).toBe('https://freeipapi.com/api/json/1.2.3.4')
    })

    it('db-ip builds self and ip URLs', () => {
      const p = defaultProviders.find((x) => x.name === 'db-ip')!
      expect(p.buildUrl({})).toBe('https://api.db-ip.com/v2/free/self')
      expect(p.buildUrl({ ip: '1.2.3.4' })).toBe('https://api.db-ip.com/v2/free/1.2.3.4')
    })

    it('geojs builds ip URL', () => {
      const p = defaultProviders.find((x) => x.name === 'geojs')!
      expect(p.buildUrl({ ip: '1.2.3.4' })).toBe('https://get.geojs.io/v1/ip/geo/1.2.3.4.json')
    })

    it('ipapi-is builds self and ip URLs', () => {
      const p = defaultProviders.find((x) => x.name === 'ipapi-is')!
      expect(p.buildUrl({})).toBe('https://api.ipapi.is')
      expect(p.buildUrl({ ip: '1.2.3.4' })).toBe('https://api.ipapi.is?ip=1.2.3.4')
    })

    it('cloudflare-trace builds URL', () => {
      const p = defaultProviders.find((x) => x.name === 'cloudflare-trace')!
      expect(p.buildUrl({})).toBe('https://1.1.1.1/cdn-cgi/trace')
    })
  })

  describe('provider parsers', () => {
    it('parseIpSb returns expected fields', () => {
      const p = defaultProviders.find((x) => x.name === 'ip-sb')!
      const result = p.parse(
        {
          ip: '8.8.8.8',
          country: 'United States',
          country_code: 'US',
          asn: 'AS15169',
        },
        {}
      )
      expect(result.ip).toBe('8.8.8.8')
      expect(result.country).toBe('United States')
      expect(result.countryCode).toBe('US')
      expect(result.asn).toBe('15169')
      expect(result.provider).toBe('ip-sb')
    })

    it('parseIpWhois returns expected fields', () => {
      const p = defaultProviders.find((x) => x.name === 'ipwhois')!
      const result = p.parse(
        {
          ip: '1.2.3.4',
          country: 'US',
          country_code: 'US',
        },
        {}
      )
      expect(result.ip).toBe('1.2.3.4')
      expect(result.provider).toBe('ipwhois')
    })

    it('parseFreeIpApi returns expected fields', () => {
      const p = defaultProviders.find((x) => x.name === 'freeipapi')!
      const result = p.parse(
        {
          ipAddress: '1.2.3.4',
          countryName: 'United States',
          countryCode: 'US',
        },
        {}
      )
      expect(result.ip).toBe('1.2.3.4')
      expect(result.provider).toBe('freeipapi')
    })

    it('parseDbIp returns expected fields', () => {
      const p = defaultProviders.find((x) => x.name === 'db-ip')!
      const result = p.parse(
        {
          ipAddress: '1.2.3.4',
          countryName: 'US',
        },
        {}
      )
      expect(result.ip).toBe('1.2.3.4')
      expect(result.provider).toBe('db-ip')
    })

    it('parseGeoJs returns expected fields', () => {
      const p = defaultProviders.find((x) => x.name === 'geojs')!
      const result = p.parse(
        {
          ip: '1.2.3.4',
          country: 'Germany',
          country_code: 'DE',
        },
        {}
      )
      expect(result.ip).toBe('1.2.3.4')
      expect(result.provider).toBe('geojs')
    })

    it('parseIpify returns ip only', () => {
      const p = defaultProviders.find((x) => x.name === 'ipify')!
      const result = p.parse({ ip: '5.5.5.5' }, {})
      expect(result.ip).toBe('5.5.5.5')
      expect(result.provider).toBe('ipify')
      expect(Object.keys(result)).toEqual(['ip', 'provider', 'raw'])
    })

    it('parseCloudflareTrace parses key=value text', () => {
      const p = defaultProviders.find((x) => x.name === 'cloudflare-trace')!
      const trace = 'ip=1.2.3.4\nloc=US\ntls=TLSv1.3'
      const result = p.parse(trace, {})
      expect(result.ip).toBe('1.2.3.4')
      expect(result.countryCode).toBe('US')
      expect(result.provider).toBe('cloudflare-trace')
    })

    it('parseIpApiIs extracts nested fields', () => {
      const p = defaultProviders.find((x) => x.name === 'ipapi-is')!
      const result = p.parse(
        {
          ip: '1.1.1.1',
          location: { country: 'Australia', country_code: 'AU', city: 'Sydney' },
          asn: { asn: 13335, org: 'Cloudflare' },
          company: { name: 'Cloudflare Inc' },
          risk: { is_proxy: false, is_vpn: false, is_tor: false },
        },
        {}
      )
      expect(result.ip).toBe('1.1.1.1')
      expect(result.country).toBe('Australia')
      expect(result.organization).toBe('Cloudflare Inc')
      expect(result.asn).toBe('13335')
      expect(result.isProxy).toBe(false)
      expect(result.provider).toBe('ipapi-is')
    })

    it('parseCloudflareTrace handles non-string input', () => {
      const p = defaultProviders.find((x) => x.name === 'cloudflare-trace')!
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 故意传入非预期类型以测试解析器的容错能力
      const result = p.parse(42 as any, {})
      expect(result.ip).toBe('')
      expect(result.provider).toBe('cloudflare-trace')
    })
  })
})
