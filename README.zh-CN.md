# @chaeco/ip-lookup

[![npm version](https://img.shields.io/npm/v/@chaeco/ip-lookup.svg)](https://www.npmjs.com/package/@chaeco/ip-lookup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[English](./README.md) | 简体中文

统一的 IP 查询插件，内置多家公开服务商并自动轮转，返回标准化查询结果。

## ✨ 特性

- 🌐 **统一结果** — 所有服务商返回统一的 `IpLookupResult` 结构
- 🔄 **自动轮转** — 查询失败时自动切换到下一个可用服务商
- 📦 **8 个内置服务商** — ip.sb、ipwhois、freeipapi、DB-IP、GeoJS、ipapi.is、ipify、Cloudflare Trace
- 🔌 **可扩展** — 实现 `IpLookupProvider` 接口即可接入自定义数据源
- 🛡️ **数据丰富** — 国家、地区、城市、运营商、ASN、坐标、代理/VPN/Tor 标记
- 🔍 **类型安全** — TypeScript 严格模式，全程显式类型
- 🧪 **测试完善** — 51 个测试用例，语句覆盖率 98%

## 安装

```bash
npm install @chaeco/ip-lookup
```

## 快速开始

```typescript
import { createIpLookupPlugin } from '@chaeco/ip-lookup'

const lookup = createIpLookupPlugin()

// 查询当前公网 IP
const self = await lookup.lookupSelf()
console.log(self.ip, self.country, self.isp)

// 查询指定 IP
const info = await lookup.lookupIp('8.8.8.8')
console.log(info.country, info.asn, info.organization)
```

## 目录

- [API](#api)
  - [createIpLookupPlugin](#createiplookuppluginoptions)
  - [plugin.lookupSelf()](#pluginlookupself)
  - [plugin.lookupIp(ip)](#pluginlookupipp)
  - [IpLookupResult](#iplookupresult)
  - [错误处理](#错误处理)
- [内置服务商](#内置服务商)
- [自定义服务商](#自定义服务商)
- [开发](#开发)

## API

### `createIpLookupPlugin(options?)`

创建 `IpLookupPlugin` 实例。

**选项：**

| 选项         | 类型                 | 默认值             | 说明                 |
| ------------ | -------------------- | ------------------ | -------------------- |
| `timeout`    | `number`             | `8000`             | 请求超时时间（毫秒） |
| `startIndex` | `number`             | `0`                | 轮转起始服务商下标   |
| `providers`  | `IpLookupProvider[]` | `defaultProviders` | 自定义服务商列表     |

### `plugin.lookupSelf()`

查询当前机器的公网 IP 信息。返回 `Promise<IpLookupResult>`。

### `plugin.lookupIp(ip: string)`

查询指定 IP 地址的信息。返回 `Promise<IpLookupResult>`。

### `IpLookupResult`

| 字段           | 类型      | 说明                       |
| -------------- | --------- | -------------------------- |
| `ip`           | `string`  | IP 地址                    |
| `country`      | `string`  | 国家或地区名称             |
| `countryCode`  | `string`  | 国家或地区代码             |
| `region`       | `string`  | 省份或州                   |
| `city`         | `string`  | 城市                       |
| `isp`          | `string`  | 运营商                     |
| `organization` | `string`  | 组织名称                   |
| `asn`          | `string`  | ASN 编号（不含 "AS" 前缀） |
| `latitude`     | `number`  | 纬度                       |
| `longitude`    | `number`  | 经度                       |
| `timezone`     | `string`  | 时区                       |
| `isProxy`      | `boolean` | 是否为代理                 |
| `isVpn`        | `boolean` | 是否为 VPN                 |
| `isTor`        | `boolean` | 是否为 Tor 出口节点        |
| `provider`     | `string`  | 命中的服务商名称           |
| `raw`          | `unknown` | 服务商原始返回数据         |

### 错误处理

当所有服务商均失败时，抛出 `IpLookupError`，其 `reasons` 数组记录了每次失败的原因：

```typescript
import { IpLookupError, createIpLookupPlugin } from '@chaeco/ip-lookup'

try {
  const result = await lookup.lookupSelf()
} catch (error) {
  if (error instanceof IpLookupError) {
    console.error('所有服务商均失败：', error.reasons)
  }
}
```

## 内置服务商

| 服务商           | 模式     | 查询本机 | 查询 IP | 响应类型 |
| ---------------- | -------- | -------- | ------- | -------- |
| ip.sb            | self, ip | ✓        | ✓       | json     |
| ipwhois          | self, ip | ✓        | ✓       | json     |
| freeipapi        | self, ip | ✓        | ✓       | json     |
| DB-IP            | self, ip | ✓        | ✓       | json     |
| GeoJS            | ip       |          | ✓       | json     |
| ipapi.is         | self, ip | ✓        | ✓       | json     |
| ipify            | self     | ✓        |         | json     |
| Cloudflare Trace | self     | ✓        |         | text     |

插件顺序遍历服务商。当某个服务商失败（网络错误、超时、解析失败）时，自动切换到下一个兼容服务商。成功后游标前移，下次查询从不同的服务商开始。

## 自定义服务商

实现 `IpLookupProvider` 接口接入自定义服务商：

```typescript
import { createIpLookupPlugin } from '@chaeco/ip-lookup'
import type { IpLookupContext, IpLookupProvider, IpLookupResult } from '@chaeco/ip-lookup'

const myProvider: IpLookupProvider = {
  name: 'my-provider',
  modes: ['self', 'ip'],
  responseType: 'json',
  buildUrl: (context: IpLookupContext) => `https://api.example.com/${context.ip ?? ''}`,
  parse: (raw: unknown): IpLookupResult => {
    const data = raw as Record<string, unknown>
    return {
      ip: String(data.ip ?? ''),
      country: String(data.country ?? ''),
      provider: 'my-provider',
      raw,
    }
  },
}

const lookup = createIpLookupPlugin({ providers: [myProvider] })
```

## 开发

```bash
# 安装依赖
npm install

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 测试并生成覆盖率
npm test

# 构建
npm run build
```

## License

MIT
