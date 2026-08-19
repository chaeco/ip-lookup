import { describe, it, expect } from 'vitest'
import {
  isRecord,
  toStringValue,
  toNumberValue,
  toBooleanValue,
  normalizeAsn,
  getRecord,
} from '../normalize'

describe('isRecord', () => {
  it('returns true for plain objects', () => {
    expect(isRecord({})).toBe(true)
    expect(isRecord({ a: 1 })).toBe(true)
  })

  it('returns false for non-objects', () => {
    expect(isRecord(null)).toBe(false)
    expect(isRecord('string')).toBe(false)
    expect(isRecord(42)).toBe(false)
    expect(isRecord(undefined)).toBe(false)
    expect(isRecord([1, 2])).toBe(false)
  })
})

describe('toStringValue', () => {
  it('returns non-empty strings', () => {
    expect(toStringValue('hello')).toBe('hello')
  })

  it('returns undefined for empty strings', () => {
    expect(toStringValue('')).toBeUndefined()
  })

  it('converts finite numbers to strings', () => {
    expect(toStringValue(123)).toBe('123')
    expect(toStringValue(0)).toBe('0')
  })

  it('returns undefined for Infinity', () => {
    expect(toStringValue(Infinity)).toBeUndefined()
  })

  it('returns undefined for other types', () => {
    expect(toStringValue(null)).toBeUndefined()
    expect(toStringValue(undefined)).toBeUndefined()
    expect(toStringValue(true)).toBeUndefined()
  })
})

describe('toNumberValue', () => {
  it('returns finite numbers', () => {
    expect(toNumberValue(42)).toBe(42)
    expect(toNumberValue(0)).toBe(0)
    expect(toNumberValue(-1.5)).toBe(-1.5)
  })

  it('converts numeric strings', () => {
    expect(toNumberValue('123')).toBe(123)
    expect(toNumberValue('45.6')).toBe(45.6)
  })

  it('returns undefined for non-numeric strings', () => {
    expect(toNumberValue('abc')).toBeUndefined()
  })

  it('returns undefined for Infinity', () => {
    expect(toNumberValue(Infinity)).toBeUndefined()
  })

  it('returns undefined for other types', () => {
    expect(toNumberValue(null)).toBeUndefined()
    expect(toNumberValue(true)).toBeUndefined()
  })
})

describe('toBooleanValue', () => {
  it('returns booleans as-is', () => {
    expect(toBooleanValue(true)).toBe(true)
    expect(toBooleanValue(false)).toBe(false)
  })

  it('returns undefined for non-booleans', () => {
    expect(toBooleanValue(1)).toBeUndefined()
    expect(toBooleanValue('true')).toBeUndefined()
    expect(toBooleanValue(null)).toBeUndefined()
  })
})

describe('getRecord', () => {
  it('extracts nested record', () => {
    const result = getRecord({ a: { b: 1 } }, 'a')
    expect(result).toEqual({ b: 1 })
  })

  it('returns undefined for non-record values', () => {
    expect(getRecord({ a: 'string' }, 'a')).toBeUndefined()
    expect(getRecord({}, 'missing')).toBeUndefined()
  })
})

describe('normalizeAsn', () => {
  it('strips AS prefix', () => {
    expect(normalizeAsn('AS12345')).toBe('12345')
  })

  it('passes through numeric ASN', () => {
    expect(normalizeAsn(12345)).toBe('12345')
  })

  it('returns undefined for undefined', () => {
    expect(normalizeAsn(undefined)).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(normalizeAsn('')).toBeUndefined()
  })
})
