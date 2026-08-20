import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'

import { defaultProviders } from './providers'
import type { IpLookupMode, IpLookupOptions, IpLookupProvider, IpLookupResult } from './types'

/** IP 查询错误 */
export class IpLookupError extends Error {
  /** 查询失败详情 */
  readonly reasons: readonly string[]

  constructor(reasons: readonly string[]) {
    super(`所有 IP 查询源均失败：${reasons.join('；')}`)
    this.name = 'IpLookupError'
    this.reasons = reasons
  }
}

/** IP 查询插件 */
export class IpLookupPlugin {
  /** HTTP 客户端 */
  private readonly http: AxiosInstance

  /** Provider 列表 */
  private readonly providers: readonly IpLookupProvider[]

  /** 下一次轮转起始下标 */
  private cursor: number

  constructor(options: IpLookupOptions = {}) {
    this.providers = options.providers ?? defaultProviders
    this.cursor = options.startIndex ?? 0
    this.http = axios.create({
      timeout: options.timeout ?? 8000,
      maxRedirects: 3,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        'User-Agent': 'ZorvethIpLookup/0.1.3',
      },
    })
  }

  /** 查询当前公网 IP 信息 */
  lookupSelf(): Promise<IpLookupResult> {
    return this.lookup()
  }

  /** 查询指定 IP 信息 */
  lookupIp(ip: string): Promise<IpLookupResult> {
    return this.lookup(ip)
  }

  /** 查询 IP 信息并自动轮转可用 Provider */
  async lookup(ip?: string): Promise<IpLookupResult> {
    const mode: IpLookupMode = ip ? 'ip' : 'self'
    const providers = this.getRotatedProviders(mode)
    const reasons: string[] = []

    for (const provider of providers) {
      try {
        const raw = await this.fetchProvider(provider, ip)
        const result = provider.parse(raw, { ip })
        this.cursor =
          (this.providers.findIndex((item: IpLookupProvider) => item.name === provider.name) + 1) %
          this.providers.length
        return result
      } catch (error: unknown) {
        reasons.push(`${provider.name}: ${this.getErrorMessage(error)}`)
      }
    }

    throw new IpLookupError(reasons)
  }

  /** 按轮转下标获取 Provider */
  private getRotatedProviders(mode: IpLookupMode): readonly IpLookupProvider[] {
    const enabledProviders = this.providers.filter((provider: IpLookupProvider) =>
      provider.modes.includes(mode)
    )
    const normalizedCursor =
      enabledProviders.length === 0 ? 0 : this.cursor % enabledProviders.length
    return [
      ...enabledProviders.slice(normalizedCursor),
      ...enabledProviders.slice(0, normalizedCursor),
    ]
  }

  /** 请求单个 Provider */
  private async fetchProvider(provider: IpLookupProvider, ip?: string): Promise<unknown> {
    const response: AxiosResponse<unknown> = await this.http.get(provider.buildUrl({ ip }), {
      responseType: provider.responseType === 'text' ? 'text' : 'json',
      transformResponse:
        provider.responseType === 'text' ? [(data: unknown): unknown => data] : undefined,
    })
    return response.data
  }

  /** 获取错误信息 */
  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.response?.status ? `HTTP ${error.response.status}` : error.message
    }

    if (error instanceof Error) {
      return error.message
    }

    return '未知错误'
  }
}

/** 创建 IP 查询插件 */
export const createIpLookupPlugin = (options: IpLookupOptions = {}): IpLookupPlugin =>
  new IpLookupPlugin(options)
