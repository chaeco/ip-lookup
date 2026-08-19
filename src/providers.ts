import {
  createResult,
  getRecord,
  isRecord,
  normalizeAsn,
  toBooleanValue,
  toNumberValue,
  toStringValue,
} from './normalize.js'
import type { IpLookupContext, IpLookupProvider, IpLookupResult } from './types.js'

/** 解析 ip.sb 返回值 */
const parseIpSb = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  return createResult({
    ip: toStringValue(data.ip) ?? '',
    country: toStringValue(data.country),
    countryCode: toStringValue(data.country_code),
    region: toStringValue(data.region),
    city: toStringValue(data.city),
    isp: toStringValue(data.isp),
    organization: toStringValue(data.organization) ?? toStringValue(data.asn_organization),
    asn: normalizeAsn(data.asn),
    latitude: toNumberValue(data.latitude),
    longitude: toNumberValue(data.longitude),
    timezone: toStringValue(data.timezone),
    provider: 'ip-sb',
    raw,
  })
}

/** 解析 ipwhois 返回值 */
const parseIpWhois = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  return createResult({
    ip: toStringValue(data.ip) ?? '',
    country: toStringValue(data.country),
    countryCode: toStringValue(data.country_code),
    region: toStringValue(data.region),
    city: toStringValue(data.city),
    isp: toStringValue(data.isp),
    organization: toStringValue(data.org),
    asn: normalizeAsn(data.asn),
    latitude: toNumberValue(data.latitude),
    longitude: toNumberValue(data.longitude),
    timezone: toStringValue(data.timezone),
    provider: 'ipwhois',
    raw,
  })
}

/** 解析 freeipapi 返回值 */
const parseFreeIpApi = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  return createResult({
    ip: toStringValue(data.ipAddress) ?? '',
    country: toStringValue(data.countryName),
    countryCode: toStringValue(data.countryCode),
    region: toStringValue(data.regionName),
    city: toStringValue(data.cityName),
    organization: toStringValue(data.asnOrganization),
    asn: normalizeAsn(data.asn),
    latitude: toNumberValue(data.latitude),
    longitude: toNumberValue(data.longitude),
    isProxy: toBooleanValue(data.isProxy),
    provider: 'freeipapi',
    raw,
  })
}

/** 解析 DB-IP 返回值 */
const parseDbIp = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  return createResult({
    ip: toStringValue(data.ipAddress) ?? '',
    country: toStringValue(data.countryName),
    countryCode: toStringValue(data.countryCode),
    region: toStringValue(data.stateProv),
    city: toStringValue(data.city),
    provider: 'db-ip',
    raw,
  })
}

/** 解析 GeoJS 返回值 */
const parseGeoJs = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  return createResult({
    ip: toStringValue(data.ip) ?? '',
    country: toStringValue(data.country),
    countryCode: toStringValue(data.country_code),
    organization: toStringValue(data.organization_name) ?? toStringValue(data.organization),
    asn: normalizeAsn(data.asn),
    latitude: toNumberValue(data.latitude),
    longitude: toNumberValue(data.longitude),
    timezone: toStringValue(data.timezone),
    provider: 'geojs',
    raw,
  })
}

/** 解析 ipify 返回值 */
const parseIpify = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  return createResult({
    ip: toStringValue(data.ip) ?? '',
    provider: 'ipify',
    raw,
  })
}

/** 解析 Cloudflare trace 返回值 */
const parseCloudflareTrace = (raw: unknown): IpLookupResult => {
  const text = typeof raw === 'string' ? raw : ''
  const data = Object.fromEntries(
    text
      .split('\n')
      .filter((line: string) => line.includes('='))
      .map((line: string) => {
        const [key, ...rest] = line.split('=')
        return [key, rest.join('=')]
      })
  )

  return createResult({
    ip: data.ip ?? '',
    countryCode: data.loc,
    provider: 'cloudflare-trace',
    raw,
  })
}

/** 解析 ipapi.is 返回值 */
const parseIpApiIs = (raw: unknown): IpLookupResult => {
  const data = isRecord(raw) ? raw : {}
  const location = getRecord(data, 'location')
  const asn = getRecord(data, 'asn')
  const company = getRecord(data, 'company')
  const risk = getRecord(data, 'risk')

  return createResult({
    ip: toStringValue(data.ip) ?? '',
    country: toStringValue(location?.country),
    countryCode: toStringValue(location?.country_code),
    region: toStringValue(location?.state),
    city: toStringValue(location?.city),
    organization: toStringValue(company?.name) ?? toStringValue(asn?.org),
    asn: normalizeAsn(asn?.asn),
    latitude: toNumberValue(location?.latitude),
    longitude: toNumberValue(location?.longitude),
    timezone: toStringValue(location?.timezone),
    isProxy: toBooleanValue(risk?.is_proxy),
    isVpn: toBooleanValue(risk?.is_vpn),
    isTor: toBooleanValue(risk?.is_tor),
    provider: 'ipapi-is',
    raw,
  })
}

/** 默认 IP 查询 Provider 列表 */
export const defaultProviders: readonly IpLookupProvider[] = [
  {
    name: 'ip-sb',
    modes: ['self', 'ip'],
    responseType: 'json',
    buildUrl: (context: IpLookupContext): string => `https://api.ip.sb/geoip/${context.ip ?? ''}`,
    parse: parseIpSb,
  },
  {
    name: 'ipwhois',
    modes: ['self', 'ip'],
    responseType: 'json',
    buildUrl: (context: IpLookupContext): string =>
      `https://ipwhois.app/json/${context.ip ?? ''}?format=json`,
    parse: parseIpWhois,
  },
  {
    name: 'freeipapi',
    modes: ['self', 'ip'],
    responseType: 'json',
    buildUrl: (context: IpLookupContext): string =>
      `https://freeipapi.com/api/json${context.ip ? `/${context.ip}` : ''}`,
    parse: parseFreeIpApi,
  },
  {
    name: 'db-ip',
    modes: ['self', 'ip'],
    responseType: 'json',
    buildUrl: (context: IpLookupContext): string =>
      `https://api.db-ip.com/v2/free/${context.ip ?? 'self'}`,
    parse: parseDbIp,
  },
  {
    name: 'geojs',
    modes: ['ip'],
    responseType: 'json',
    buildUrl: (context: IpLookupContext): string =>
      `https://get.geojs.io/v1/ip/geo/${context.ip}.json`,
    parse: parseGeoJs,
  },
  {
    name: 'ipapi-is',
    modes: ['self', 'ip'],
    responseType: 'json',
    buildUrl: (context: IpLookupContext): string =>
      `https://api.ipapi.is${context.ip ? `?ip=${context.ip}` : ''}`,
    parse: parseIpApiIs,
  },
  {
    name: 'ipify',
    modes: ['self'],
    responseType: 'json',
    buildUrl: (): string => 'https://api.ipify.org?format=json',
    parse: parseIpify,
  },
  {
    name: 'cloudflare-trace',
    modes: ['self'],
    responseType: 'text',
    buildUrl: (): string => 'https://1.1.1.1/cdn-cgi/trace',
    parse: parseCloudflareTrace,
  },
]