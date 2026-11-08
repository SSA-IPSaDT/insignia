import type { CommonErrorCode } from '@insignia/contracts/common';

export type SdkErrorType = 'api' | 'network' | 'http' | 'parse';

/**
 * 1. Ошибка бизнес-домена, возвращенная бэкендом Insignia по контракту
 */
export type SdkApiError<TCode extends string = string> = {
    type: 'api';
    status: number;
    code: TCode;
    message: string;
    details?: unknown;
};

export type SdkNetworkErrorCode =
    'TIMEOUT' | 'OFFLINE' | 'CONNECTION_REFUSED' | 'ABORTED' | 'NETWORK_ERROR';

/**
 * 2. Сетевой / транспортный сбой (нет соединения, отказ порта, таймаут, отмена)
 */
export type SdkNetworkError = {
    type: 'network';
    status: 0;
    code: SdkNetworkErrorCode;
    message: string;
    cause?: unknown;
};

export type SdkHttpErrorCode = 'BAD_GATEWAY' | 'GATEWAY_TIMEOUT' | 'HTTP_ERROR';

/**
 * 3. Неконтрактный ответ инфраструктуры (прокси, Nginx 502/504, Cloudflare, WAF 429)
 */
export type SdkHttpError = {
    type: 'http';
    status: number;
    code: SdkHttpErrorCode;
    message: string;
    rawBody?: string;
};

export type SdkParseErrorCode = 'PARSE_ERROR';

/**
 * 4. Ошибка декодирования/парсинга JSON ответа сервера
 */
export type SdkParseError = {
    type: 'parse';
    status: number;
    code: SdkParseErrorCode;
    message: string;
    cause?: unknown;
};

/**
 * Исчерпывающее дискриминированное объединение ошибок SDK
 */
export type InsigniaSdkError<TCode extends string = CommonErrorCode> =
    SdkApiError<TCode> | SdkNetworkError | SdkHttpError | SdkParseError;

export type InsigniaSdkErrorResponse<TCode extends string = CommonErrorCode> = {
    success: false;
    error: InsigniaSdkError<TCode>;
};

export type InsigniaSdkResult<TData, TCode extends string = CommonErrorCode> =
    { success: true; data: TData } | InsigniaSdkErrorResponse<TCode>;

export class InsigniaApiError<
    TCode extends string = CommonErrorCode,
> extends Error {
    constructor(
        public readonly status: number,
        public readonly code: TCode,
        message: string,
        public readonly details?: unknown,
        public override readonly cause?: Error,
    ) {
        super(message);
        this.name = 'InsigniaApiError';
    }
}
