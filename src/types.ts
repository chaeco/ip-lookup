/** IP 查询模式 */
export type IpLookupMode = 'self' | 'ip'

/** 请求响应类型 */
export type ProviderResponseType = 'json' | 'text'

/** IP 查询统一返回值 */
export interface IpLookupResult {
  /** IP 地址 */
  ip: string
  /** 国家或地区名称 */
  country?: string
  /** 国家或地区代码 */
  countryCode?: string
  /** 省份或州 */
  region?: string
  /** 城市 */
  city?: string
  /** 运营商 */
  isp?: string
  /** 组织名称 */
  organization?: string
  /** ASN 编号 */
  asn?: string
  /** 纬度 */
  latitude?: number
  /** 经度 */
  longitude?: number
  /** 时区 */
  timezone?: string
  /** 是否代理 */
  isProxy?: boolean
  /** 是否 VPN */
  isVpn?: boolean
  /** 是否 Tor */
  isTor?: boolean
  /** 命中的服务商 */
  provider: string
  /** 原始返回数据 */
  raw: unknown
}

/** Provider 请求上下文 */
export interface IpLookupContext {
  /** 查询 IP，不传表示查询当前公网 IP */
  ip?: string
}

/** Provider 适配器 */
export interface IpLookupProvider {
  /** Provider 唯一名称 */
  name: string
  /** 支持的查询模式 */
  modes: readonly IpLookupMode[]
  /** 响应类型 */
  responseType: ProviderResponseType
  /** 构建请求地址 */
  buildUrl: (context: IpLookupContext) => string
  /** 解析统一返回值 */
  parse: (raw: unknown, context: IpLookupContext) => IpLookupResult
}

/** 查询插件配置 */
export interface IpLookupOptions {
  /** 请求超时时间，单位毫秒 */
  timeout?: number
  /** 初始 Provider 下标 */
  startIndex?: number
  /** 自定义 Provider 列表 */
  providers?: readonly IpLookupProvider[]
}