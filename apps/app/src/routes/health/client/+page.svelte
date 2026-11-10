<script lang="ts">
    import { PUBLIC_API_URL } from '$app/env/public';
    import { resolve } from '$app/paths';

    import api from '#lib/api';

    type HealthResult = Awaited<ReturnType<typeof api.health.check>> | null;

    let result = $state<HealthResult>(null);
    let isLoading = $state(false);

    const checkHealth = async (): Promise<void> => {
        isLoading = true;
        result = await api.health.check();
        isLoading = false;
    };
</script>

<main
    style="max-width: 600px; margin: 40px auto; font-family: system-ui, sans-serif; padding: 20px;"
>
    <h1>API Health Check (Client Browser)</h1>
    <p>
        Проверка сетевого запроса к бэкенду напрямую из браузера через Insignia
        Client SDK.
    </p>

    <div style="margin: 20px 0;">
        <button
            type="button"
            onclick={checkHealth}
            disabled={isLoading}
            style="padding: 10px 18px; font-size: 14px; cursor: pointer;"
        >
            {isLoading
                ? 'Выполняется запрос...'
                : 'Запросить статус из браузера'}
        </button>
    </div>

    {#if result}
        <div
            style="padding: 16px; border: 1px solid #ccc; border-radius: 8px; margin: 20px 0; background: #fafafa;"
        >
            {#if result.success}
                <h3 style="color: #059669; margin-top: 0;">
                    ✓ Статус: {result.data.status.toUpperCase()}
                </h3>
                <p><strong>Аптайм:</strong> {result.data.uptime} с</p>
                <p><strong>БД:</strong> {result.data.services.database}</p>
                <p><strong>Время ответа:</strong> {result.data.timestamp}</p>
            {:else}
                <h3 style="color: #dc2626; margin-top: 0;">
                    ✕ [{result.error.type.toUpperCase()}] {result.error.code} (HTTP
                    {result.error.status})
                </h3>
                <p>{result.error.message}</p>
            {/if}
        </div>

        <h3>Ответ API (JSON):</h3>
        <pre
            style="background: #eee; padding: 12px; border-radius: 6px; overflow-x: auto;">{JSON.stringify(
                result,
                null,
                2,
            )}</pre>
    {/if}

    <div style="margin-top: 24px; display: flex; gap: 12px;">
        <a href={resolve('/health')}>Перейти к серверному Health Check (SSR)</a>
        <span>|</span>
        <a href={resolve('/')}>Вернуться на главную</a>
    </div>
</main>
