# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-08-19

### Changed

- **Build system → Rollup** — replaced `tsc` emit with a unified `rollup` bundle (single ESM `dist/index.js` + bundled `dist/index.d.ts`). Relative source imports no longer need a `.js` extension; `moduleResolution` is now `bundler`.

### Added

- **Project website** — `website/` landing page (unified Chaeco dark-terminal style) with live terminal demo, provider capability matrix, usage tabs, and install CTA.
- **GitHub Pages workflow** — `.github/workflows/pages.yml` deploys `website/` to GitHub Pages.

## [0.1.0] - 2026-08-19

### Added

- **IP lookup plugin** — `IpLookupPlugin` class with `lookupSelf()` / `lookupIp()` methods
- **Provider rotation** — automatic fallback to next compatible provider on failure, cursor-based round-robin
- **8 built-in providers** — ip.sb, ipwhois, freeipapi, DB-IP, GeoJS, ipapi.is, ipify, Cloudflare Trace
- **Unified result model** — `IpLookupResult` with IP, country, region, city, ISP, ASN, coordinates, proxy/VPN/Tor flags, and raw response
- **Custom provider support** — implement `IpLookupProvider` interface for custom data sources
- **Error handling** — `IpLookupError` with per-provider failure reasons
- **Coverage-gated tests** — 51 tests, 98% statement coverage, 90% thresholds
- **ESM-only build** — TypeScript 6, ES2022 target, NodeNext module resolution
