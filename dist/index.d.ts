/** IP 查询模式 */
type IpLookupMode = 'self' | 'ip';
/** 请求响应类型 */
type ProviderResponseType = 'json' | 'text';
/** IP 查询统一返回值 */
interface IpLookupResult {
    /** IP 地址 */
    ip: string;
    /** 国家或地区名称 */
    country?: string;
    /** 国家或地区代码 */
    countryCode?: string;
    /** 省份或州 */
    region?: string;
    /** 城市 */
    city?: string;
    /** 运营商 */
    isp?: string;
    /** 组织名称 */
    organization?: string;
    /** ASN 编号 */
    asn?: string;
    /** 纬度 */
    latitude?: number;
    /** 经度 */
    longitude?: number;
    /** 时区 */
    timezone?: string;
    /** 是否代理 */
    isProxy?: boolean;
    /** 是否 VPN */
    isVpn?: boolean;
    /** 是否 Tor */
    isTor?: boolean;
    /** 命中的服务商 */
    provider: string;
    /** 原始返回数据 */
    raw: unknown;
}
/** Provider 请求上下文 */
interface IpLookupContext {
    /** 查询 IP，不传表示查询当前公网 IP */
    ip?: string;
}
/** Provider 适配器 */
interface IpLookupProvider {
    /** Provider 唯一名称 */
    name: string;
    /** 支持的查询模式 */
    modes: readonly IpLookupMode[];
    /** 响应类型 */
    responseType: ProviderResponseType;
    /** 构建请求地址 */
    buildUrl: (context: IpLookupContext) => string;
    /** 解析统一返回值 */
    parse: (raw: unknown, context: IpLookupContext) => IpLookupResult;
}
/** 查询插件配置 */
interface IpLookupOptions {
    /** 请求超时时间，单位毫秒 */
    timeout?: number;
    /** 初始 Provider 下标 */
    startIndex?: number;
    /** 自定义 Provider 列表 */
    providers?: readonly IpLookupProvider[];
}

/** IP 查询错误 */
declare class IpLookupError extends Error {
    /** 查询失败详情 */
    readonly reasons: readonly string[];
    constructor(reasons: readonly string[]);
}
/** IP 查询插件 */
declare class IpLookupPlugin {
    /** HTTP 客户端 */
    private readonly http;
    /** Provider 列表 */
    private readonly providers;
    /** 下一次轮转起始下标 */
    private cursor;
    constructor(options?: IpLookupOptions);
    /** 查询当前公网 IP 信息 */
    lookupSelf(): Promise<IpLookupResult>;
    /** 查询指定 IP 信息 */
    lookupIp(ip: string): Promise<IpLookupResult>;
    /** 查询 IP 信息并自动轮转可用 Provider */
    lookup(ip?: string): Promise<IpLookupResult>;
    /** 按轮转下标获取 Provider */
    private getRotatedProviders;
    /** 请求单个 Provider */
    private fetchProvider;
    /** 获取错误信息 */
    private getErrorMessage;
}
/** 创建 IP 查询插件 */
declare const createIpLookupPlugin: (options?: IpLookupOptions) => IpLookupPlugin;

/** 默认 IP 查询 Provider 列表 */
declare const defaultProviders: readonly IpLookupProvider[];

export { IpLookupError, IpLookupPlugin, createIpLookupPlugin, defaultProviders };
export type { IpLookupContext, IpLookupMode, IpLookupOptions, IpLookupProvider, IpLookupResult, ProviderResponseType };
