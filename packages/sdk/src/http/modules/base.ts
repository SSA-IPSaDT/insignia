import type { ApiResponse, CommonErrorCode } from '@insignia/contracts/common';
import { isHTTPError, type KyInstance } from 'ky';

import {
    InsigniaApiError,
    type InsigniaSdkResult,
    type SdkHttpErrorCode,
    type SdkNetworkErrorCode,
} from '#errors';

import { Paginator, type PaginatorFetcher } from '../paginator';

export abstract class BaseModule {
    constructor(protected readonly http: KyInstance) {}

    /**
     * Создание переиспользуемого ленивого пагинатора для пагинированных ручек API.
     */
    protected createPaginator = <TItem, TCode extends string = CommonErrorCode>(
        fetcher: PaginatorFetcher<TItem, TCode>,
        initialLimit?: number,
    ): Paginator<TItem, TCode> => {
        return new Paginator(fetcher, initialLimit);
    };

    /**
     * Безопасное преобразование объекта параметров в плоский объект для searchParams в Ky.
     * Исключает undefined и null значения.
     */
    protected toSearchParams = (
        params?: Record<string, unknown>,
    ): Record<string, string | number> | undefined => {
        if (!params) return undefined;
        const result: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                result[key] =
                    typeof value === 'object'
                        ? JSON.stringify(value)
                        : (value as string | number);
            }
        }
        return result;
    };

    /**
     * Безопасное выполнение HTTP-запроса в формате Result Pattern (дискриминированное объединение)
     * Никогда не выбрасывает исключений наружу — возвращает InsigniaSdkResult<T, TCode>.
     */
    protected execute = async <T, TCode extends string = CommonErrorCode>(
        requestFn: () => Promise<ApiResponse<T>>,
    ): Promise<InsigniaSdkResult<T, TCode>> => {
        try {
            return await requestFn();
        } catch (error) {
            // 1. Контрактная ошибка бэкенда Insignia (обработана бэкендом)
            if (error instanceof InsigniaApiError) {
                return {
                    success: false,
                    error: {
                        type: 'api',
                        status: error.status,
                        code: error.code as TCode,
                        message: error.message,
                        details: error.details,
                    },
                };
            }

            // 2. Неконтрактный ответ HTTP инфраструктуры (502 Bad Gateway, 504 Timeout, WAF 429)
            if (isHTTPError(error)) {
                const status = error.response.status;
                let code: SdkHttpErrorCode = 'HTTP_ERROR';
                if (status === 502) code = 'BAD_GATEWAY';
                else if (status === 504) code = 'GATEWAY_TIMEOUT';

                let rawBody: string | undefined;
                if (typeof error.data === 'string') {
                    rawBody = error.data;
                }

                return {
                    success: false,
                    error: {
                        type: 'http',
                        status,
                        code,
                        message: `HTTP ${status}: ${error.response.statusText || 'Непредвиденный ответ шлюза/сервера'}`,
                        rawBody,
                    },
                };
            }

            const formatErrorCause = (err: unknown): unknown => {
                if (err instanceof Error) {
                    return {
                        name: err.name,
                        message: err.message,
                    };
                }
                return err;
            };

            // 3. Ошибка парсинга/декодирования ответа (битый JSON, обрыв потока)
            if (error instanceof SyntaxError) {
                return {
                    success: false,
                    error: {
                        type: 'parse',
                        status: 200,
                        code: 'PARSE_ERROR',
                        message:
                            error.message ||
                            'Ошибка декодирования ответа сервера',
                        cause: formatErrorCause(error),
                    },
                };
            }

            // 4. Сетевой / транспортный сбой (нет связи, отказ порта, таймаут, отмена запроса)
            let code: SdkNetworkErrorCode = 'NETWORK_ERROR';
            const msg = error instanceof Error ? error.message : String(error);
            const name = error instanceof Error ? error.name : '';

            if (
                name === 'TimeoutError' ||
                msg.includes('timeout') ||
                msg.includes('timed out')
            ) {
                code = 'TIMEOUT';
            } else if (name === 'AbortError' || msg.includes('aborted')) {
                code = 'ABORTED';
            } else if (
                msg.includes('ECONNREFUSED') ||
                msg.includes('Connection refused')
            ) {
                code = 'CONNECTION_REFUSED';
            } else if (
                msg.includes('Failed to fetch') ||
                msg.includes('network offline') ||
                msg.includes('NetworkError') ||
                msg.includes('network error')
            ) {
                code = 'OFFLINE';
            }

            return {
                success: false,
                error: {
                    type: 'network',
                    status: 0,
                    code,
                    message: msg || 'Сетевой сбой при обращении к API',
                    cause: formatErrorCause(error),
                },
            };
        }
    };
}
