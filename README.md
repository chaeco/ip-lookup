# ip-lookup

IP lookup plugin with rotating public providers and normalized results.

## Features

- Query your current public IP information or a specific IP
- 8 built-in providers with automatic rotation on failure
- Unified result format across all providers
- Extensible plugin system with custom providers
- Coverage-gated tests (90%+ statement coverage)

## Installation

```bash
npm install @chaeco/ip-lookup
```

## Usage

```typescript
import { createIpLookupPlugin } from '@chaeco/ip-lookup'

const lookup = createIpLookupPlugin()

// Query current public IP
const self = await lookup.lookupSelf()
console.log(self.ip, self.country, self.isp)

// Query specific IP
const info = await lookup.lookupIp('8.8.8.8')
console.log(info.country, info.asn, info.organization)
```

## API

### `createIpLookupPlugin(options?)`

Creates a new `IpLookupPlugin` instance.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `8000` | Request timeout in milliseconds |
| `startIndex` | `number` | `0` | Initial provider index for rotation |
| `providers` | `IpLookupProvider[]` | `defaultProviders` | Custom provider list |

### `plugin.lookupSelf()`

Resolves with the current machine's public IP information. Returns `Promise<IpLookupResult>`.

### `plugin.lookupIp(ip: string)`

Resolves with information for a specific IP address. Returns `Promise<IpLookupResult>`.

### `IpLookupResult`

| Field | Type | Description |
|-------|------|-------------|
| `ip` | `string` | IP address |
| `country` | `string` | Country or region name |
| `countryCode` | `string` | Country or region code |
| `region` | `string` | Province or state |
| `city` | `string` | City |
| `isp` | `string` | ISP name |
| `organization` | `string` | Organization name |
| `asn` | `string` | ASN number (without "AS" prefix) |
| `latitude` | `number` | Latitude |
| `longitude` | `number` | Longitude |
| `timezone` | `string` | Timezone |
| `isProxy` | `boolean` | Whether the IP is a proxy |
| `isVpn` | `boolean` | Whether the IP is a VPN |
| `isTor` | `boolean` | Whether the IP is a Tor exit node |
| `provider` | `string` | Provider name that served the result |
| `raw` | `unknown` | Raw response data from the provider |

### Error Handling

When all providers fail, an `IpLookupError` is thrown with a `reasons` array detailing each failure:

```typescript
import { IpLookupError, createIpLookupPlugin } from '@chaeco/ip-lookup'

try {
  const result = await lookup.lookupSelf()
} catch (error) {
  if (error instanceof IpLookupError) {
    console.error('All providers failed:', error.reasons)
  }
}
```

## Built-in Providers

| Provider | Modes | Self | IP | Response Type |
|----------|-------|------|----|---------------|
| ip.sb | self, ip | ✓ | ✓ | json |
| ipwhois | self, ip | ✓ | ✓ | json |
| freeipapi | self, ip | ✓ | ✓ | json |
| DB-IP | self, ip | ✓ | ✓ | json |
| GeoJS | ip | | ✓ | json |
| ipapi.is | self, ip | ✓ | ✓ | json |
| ipify | self | ✓ | | json |
| Cloudflare Trace | self | ✓ | | text |

The plugin rotates through providers sequentially. When a provider fails (network error, timeout, parse failure), it automatically falls through to the next compatible provider. The cursor advances on success so the next query starts from a different provider.

## Custom Providers

Implement the `IpLookupProvider` interface to add your own provider:

```typescript
import { createIpLookupPlugin } from '@chaeco/ip-lookup'
import type { IpLookupContext, IpLookupProvider, IpLookupResult } from '@chaeco/ip-lookup'

const myProvider: IpLookupProvider = {
  name: 'my-provider',
  modes: ['self', 'ip'],
  responseType: 'json',
  buildUrl: (context: IpLookupContext) =>
    `https://api.example.com/${context.ip ?? ''}`,
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

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Lint
npm run lint

# Test with coverage
npm test

# Build
npm run build
```

## License

MIT