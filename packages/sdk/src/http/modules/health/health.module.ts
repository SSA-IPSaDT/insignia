import type { HealthDTO, HealthErrorCode } from '@insignia/contracts/health';

import type { InsigniaSdkResult } from '#errors';
import { BaseModule } from '#http/modules/base';

export class HealthModule extends BaseModule {
    /**
     * Проверка работоспособности сервиса и зависимостей (БД, Redis).
     * Возвращает InsigniaSdkResult<HealthDTO, HealthErrorCode> (никогда не выбрасывает исключений).
     */
    public check = async (): Promise<
        InsigniaSdkResult<HealthDTO, HealthErrorCode>
    > => {
        return this.execute<HealthDTO, HealthErrorCode>(async () => {
            return await this.http.get('health').json<HealthDTO>();
        });
    };
}
