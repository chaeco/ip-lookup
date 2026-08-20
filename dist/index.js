import axios, { AxiosError } from 'axios';

/** 判断是否为对象字典 */
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
/** 转换为字符串 */
const toStringValue = (value) => {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value.toString();
    }
    return undefined;
};
/** 转换为数字 */
const toNumberValue = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === 'string' && value.length > 0) {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) ? numberValue : undefined;
    }
    return undefined;
};
/** 转换为布尔值 */
const toBooleanValue = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    return undefined;
};
/** 读取嵌套对象 */
const getRecord = (record, key) => {
    const value = record[key];
    return isRecord(value) ? value : undefined;
};
/** 标准化 ASN */
const normalizeAsn = (value) => {
    const asn = toStringValue(value);
    return asn?.replace(/^AS/i, '');
};
/** 创建统一返回值 */
const createResult = (result) => result;

/** 解析 ip.sb 返回值 */
const parseIpSb = (raw) => {
    const data = isRecord(raw) ? raw : {};
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
    });
};
/** 解析 ipwhois 返回值 */
const parseIpWhois = (raw) => {
    const data = isRecord(raw) ? raw : {};
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
    });
};
/** 解析 freeipapi 返回值 */
const parseFreeIpApi = (raw) => {
    const data = isRecord(raw) ? raw : {};
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
    });
};
/** 解析 DB-IP 返回值 */
const parseDbIp = (raw) => {
    const data = isRecord(raw) ? raw : {};
    return createResult({
        ip: toStringValue(data.ipAddress) ?? '',
        country: toStringValue(data.countryName),
        countryCode: toStringValue(data.countryCode),
        region: toStringValue(data.stateProv),
        city: toStringValue(data.city),
        provider: 'db-ip',
        raw,
    });
};
/** 解析 GeoJS 返回值 */
const parseGeoJs = (raw) => {
    const data = isRecord(raw) ? raw : {};
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
    });
};
/** 解析 ipify 返回值 */
const parseIpify = (raw) => {
    const data = isRecord(raw) ? raw : {};
    return createResult({
        ip: toStringValue(data.ip) ?? '',
        provider: 'ipify',
        raw,
    });
};
/** 解析 Cloudflare trace 返回值 */
const parseCloudflareTrace = (raw) => {
    const text = typeof raw === 'string' ? raw : '';
    const data = Object.fromEntries(text
        .split('\n')
        .filter((line) => line.includes('='))
        .map((line) => {
        const [key, ...rest] = line.split('=');
        return [key, rest.join('=')];
    }));
    return createResult({
        ip: data.ip ?? '',
        countryCode: data.loc,
        provider: 'cloudflare-trace',
        raw,
    });
};
/** 解析 ipapi.is 返回值 */
const parseIpApiIs = (raw) => {
    const data = isRecord(raw) ? raw : {};
    const location = getRecord(data, 'location');
    const asn = getRecord(data, 'asn');
    const company = getRecord(data, 'company');
    const risk = getRecord(data, 'risk');
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
    });
};
/** 默认 IP 查询 Provider 列表 */
const defaultProviders = [
    {
        name: 'ip-sb',
        modes: ['self', 'ip'],
        responseType: 'json',
        buildUrl: (context) => `https://api.ip.sb/geoip/${context.ip ?? ''}`,
        parse: parseIpSb,
    },
    {
        name: 'ipwhois',
        modes: ['self', 'ip'],
        responseType: 'json',
        buildUrl: (context) => `https://ipwhois.app/json/${context.ip ?? ''}?format=json`,
        parse: parseIpWhois,
    },
    {
        name: 'freeipapi',
        modes: ['self', 'ip'],
        responseType: 'json',
        buildUrl: (context) => `https://freeipapi.com/api/json${context.ip ? `/${context.ip}` : ''}`,
        parse: parseFreeIpApi,
    },
    {
        name: 'db-ip',
        modes: ['self', 'ip'],
        responseType: 'json',
        buildUrl: (context) => `https://api.db-ip.com/v2/free/${context.ip ?? 'self'}`,
        parse: parseDbIp,
    },
    {
        name: 'geojs',
        modes: ['ip'],
        responseType: 'json',
        buildUrl: (context) => `https://get.geojs.io/v1/ip/geo/${context.ip}.json`,
        parse: parseGeoJs,
    },
    {
        name: 'ipapi-is',
        modes: ['self', 'ip'],
        responseType: 'json',
        buildUrl: (context) => `https://api.ipapi.is${context.ip ? `?ip=${context.ip}` : ''}`,
        parse: parseIpApiIs,
    },
    {
        name: 'ipify',
        modes: ['self'],
        responseType: 'json',
        buildUrl: () => 'https://api.ipify.org?format=json',
        parse: parseIpify,
    },
    {
        name: 'cloudflare-trace',
        modes: ['self'],
        responseType: 'text',
        buildUrl: () => 'https://1.1.1.1/cdn-cgi/trace',
        parse: parseCloudflareTrace,
    },
];

/** IP 查询错误 */
class IpLookupError extends Error {
    /** 查询失败详情 */
    reasons;
    constructor(reasons) {
        super(`所有 IP 查询源均失败：${reasons.join('；')}`);
        this.name = 'IpLookupError';
        this.reasons = reasons;
    }
}
/** IP 查询插件 */
class IpLookupPlugin {
    /** HTTP 客户端 */
    http;
    /** Provider 列表 */
    providers;
    /** 下一次轮转起始下标 */
    cursor;
    constructor(options = {}) {
        this.providers = options.providers ?? defaultProviders;
        this.cursor = options.startIndex ?? 0;
        this.http = axios.create({
            timeout: options.timeout ?? 8000,
            maxRedirects: 3,
            headers: {
                Accept: 'application/json,text/plain,*/*',
                'User-Agent': 'ZorvethIpLookup/0.1.2',
            },
        });
    }
    /** 查询当前公网 IP 信息 */
    lookupSelf() {
        return this.lookup();
    }
    /** 查询指定 IP 信息 */
    lookupIp(ip) {
        return this.lookup(ip);
    }
    /** 查询 IP 信息并自动轮转可用 Provider */
    async lookup(ip) {
        const mode = ip ? 'ip' : 'self';
        const providers = this.getRotatedProviders(mode);
        const reasons = [];
        for (const provider of providers) {
            try {
                const raw = await this.fetchProvider(provider, ip);
                const result = provider.parse(raw, { ip });
                this.cursor =
                    (this.providers.findIndex((item) => item.name === provider.name) + 1) %
                        this.providers.length;
                return result;
            }
            catch (error) {
                reasons.push(`${provider.name}: ${this.getErrorMessage(error)}`);
            }
        }
        throw new IpLookupError(reasons);
    }
    /** 按轮转下标获取 Provider */
    getRotatedProviders(mode) {
        const enabledProviders = this.providers.filter((provider) => provider.modes.includes(mode));
        const normalizedCursor = enabledProviders.length === 0 ? 0 : this.cursor % enabledProviders.length;
        return [
            ...enabledProviders.slice(normalizedCursor),
            ...enabledProviders.slice(0, normalizedCursor),
        ];
    }
    /** 请求单个 Provider */
    async fetchProvider(provider, ip) {
        const response = await this.http.get(provider.buildUrl({ ip }), {
            responseType: provider.responseType === 'text' ? 'text' : 'json',
            transformResponse: provider.responseType === 'text' ? [(data) => data] : undefined,
        });
        return response.data;
    }
    /** 获取错误信息 */
    getErrorMessage(error) {
        if (error instanceof AxiosError) {
            return error.response?.status ? `HTTP ${error.response.status}` : error.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return '未知错误';
    }
}
/** 创建 IP 查询插件 */
const createIpLookupPlugin = (options = {}) => new IpLookupPlugin(options);

export { IpLookupError, IpLookupPlugin, createIpLookupPlugin, defaultProviders };
//# sourceMappingURL=index.js.map
