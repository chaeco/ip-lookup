# ip-lookup

IP lookup plugin with rotating public providers and normalized results.

## Features

- Query your current public IP information or a specific IP
- 8 built-in providers with automatic rotation on failure
- Unified result format across all providers
- Extensible plugin system with custom providers

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

## Built-in Providers

| Provider | Mode | Self | IP |
|----------|------|------|----|
| ip.sb | self, ip | ✓ | ✓ |
| ipwhois | self, ip | ✓ | ✓ |
| freeipapi | self, ip | ✓ | ✓ |
| DB-IP | self, ip | ✓ | ✓ |
| GeoJS | ip | | ✓ |
| ipapi.is | self, ip | ✓ | ✓ |
| ipify | self | ✓ | |
| Cloudflare Trace | self | ✓ | |