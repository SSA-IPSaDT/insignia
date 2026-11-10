<script lang="ts">
    import { resolve } from '$app/paths';

    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();
</script>

<main
    style="max-width: 600px; margin: 40px auto; font-family: system-ui, sans-serif; padding: 20px;"
>
    <h1>API Health Check (SSR)</h1>
    <p>
        Проверка работоспособности бэкенда через SDK на стороне SvelteKit
        сервера в <code>apps/app</code>.
    </p>

    <div
        style="padding: 16px; border: 1px solid #ccc; border-radius: 8px; margin: 20px 0; background: #fafafa;"
    >
        {#if data.result.success}
            <h3 style="color: #059669; margin-top: 0;">
                ✓ Статус: {data.result.data.status.toUpperCase()}
            </h3>
            <p><strong>Аптайм:</strong> {data.result.data.uptime} с</p>
            <p><strong>БД:</strong> {data.result.data.services.database}</p>
            <p><strong>Время ответа:</strong> {data.result.data.timestamp}</p>
        {:else}
            <h3 style="color: #dc2626; margin-top: 0;">
                ✕ [{data.result.error.type.toUpperCase()}] {data.result.error
                    .code} (HTTP {data.result.error.status})
            </h3>
            <p>{data.result.error.message}</p>
        {/if}
    </div>

    <h3>Ответ API (JSON):</h3>
    <pre
        style="background: #eee; padding: 12px; border-radius: 6px; overflow-x: auto;">{JSON.stringify(
            data.result,
            null,
            2,
        )}</pre>

    <div style="margin-top: 24px; display: flex; gap: 12px;">
        <a href={resolve('/health/client')}
            >Проверить из браузера (Client Check)</a
        >
        <span>|</span>
        <a href={resolve('/')}>Вернуться на главную</a>
    </div>
</main>
