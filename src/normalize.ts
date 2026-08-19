import type { IpLookupResult } from './types'

/** 字符串字典 */
type RawRecord = Record<string, unknown>

/** 判断是否为对象字典 */
export const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** 转换为字符串 */
export const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString()
  }

  return undefined
}

/** 转换为数字 */
export const toNumberValue = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.length > 0) {
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : undefined
  }

  return undefined
}

/** 转换为布尔值 */
export const toBooleanValue = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value
  }

  return undefined
}

/** 读取嵌套对象 */
export const getRecord = (record: RawRecord, key: string): RawRecord | undefined => {
  const value = record[key]
  return isRecord(value) ? value : undefined
}

/** 标准化 ASN */
export const normalizeAsn = (value: unknown): string | undefined => {
  const asn = toStringValue(value)
  return asn?.replace(/^AS/i, '')
}

/** 创建统一返回值 */
export const createResult = (result: IpLookupResult): IpLookupResult => result
