<script lang="ts">
    import { resolve } from '$app/paths';
    import ActivityIcon from '@lucide/svelte/icons/activity';
    import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
    import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
    import GlobeIcon from '@lucide/svelte/icons/globe';
    import Loader2Icon from '@lucide/svelte/icons/loader-2';
    import MoonIcon from '@lucide/svelte/icons/moon';
    import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
    import ServerIcon from '@lucide/svelte/icons/server';
    import SunIcon from '@lucide/svelte/icons/sun';
    import XCircleIcon from '@lucide/svelte/icons/x-circle';
    import { mode, toggleMode } from 'mode-watcher';
    import { toast } from 'svelte-sonner';

    import api from '#lib/api';

    type HealthResult = Awaited<ReturnType<typeof api.health.check>> | null;

    let result = $state<HealthResult>(null);
    let isLoading = $state(false);

    const checkHealth = async (): Promise<void> => {
        isLoading = true;
        const res = await api.health.check();
        result = res;

        if (res.success) {
            toast.success('Ответ от API успешно получен в браузере!');
        } else {
            toast.error(`[${res.error.code}] ${res.error.message}`);
        }

        isLoading = false;
    };
</script>

<main
    class="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6"
>
    <div
        class="bg-card text-card-foreground border-border w-full max-w-lg space-y-6 rounded-xl border p-8 shadow-sm"
    >
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <GlobeIcon class="text-primary size-7" />
                <div>
                    <h1 class="text-xl font-bold tracking-tight">
                        Клиентский Health Check
                    </h1>
                    <p class="text-muted-foreground text-xs">
                        Прямой запрос из браузера через Insignia Client SDK
                    </p>
                </div>
            </div>

            <button
                type="button"
                onclick={toggleMode}
                aria-label="Toggle theme"
                class="border-border hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-lg border p-2 transition-colors"
            >
                {#if mode.current === 'dark'}
                    <SunIcon class="size-4" />
                {:else}
                    <MoonIcon class="size-4" />
                {/if}
            </button>
        </div>

        <p class="text-muted-foreground text-sm">
            Проверка прямого взаимодействия браузера с REST API через
            синглтон-клиент <code
                class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs"
                >api.health.check()</code
            > без проксирования через Node.js/Bun сервер.
        </p>

        <div class="pt-1">
            <button
                type="button"
                onclick={checkHealth}
                disabled={isLoading}
                class="bg-primary text-primary-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            >
                {#if isLoading}
                    <Loader2Icon class="size-4 animate-spin" />
                    <span>Выполняется запрос...</span>
                {:else}
                    <RefreshCwIcon class="size-4" />
                    <span>Запросить статус из браузера</span>
                {/if}
            </button>
        </div>

        {#if result}
            {#if result.success}
                <div
                    class="border-border bg-accent/30 space-y-3 rounded-lg border p-4"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Статус ответа:</span>
                        <span
                            class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        >
                            <CheckCircle2Icon class="size-3.5" />
                            {result.data.status.toUpperCase()}
                        </span>
                    </div>

                    <div
                        class="text-muted-foreground grid grid-cols-2 gap-2 text-xs"
                    >
                        <div>
                            <span class="text-foreground font-medium"
                                >Аптайм:</span
                            >
                            {result.data.uptime} с
                        </div>
                        <div>
                            <span class="text-foreground font-medium">БД:</span>
                            {result.data.services.database}
                        </div>
                        <div class="col-span-2 truncate">
                            <span class="text-foreground font-medium"
                                >Время:</span
                            >
                            {result.data.timestamp}
                        </div>
                    </div>
                </div>
            {:else}
                <div
                    class="border-destructive/30 bg-destructive/10 space-y-2 rounded-lg border p-4 text-xs"
                >
                    <div
                        class="text-destructive flex items-center gap-2 font-semibold"
                    >
                        <XCircleIcon class="size-4" />
                        <span
                            >[{result.error.type.toUpperCase()}] {result.error
                                .code} (HTTP {result.error.status})</span
                        >
                    </div>
                    <p class="text-muted-foreground">{result.error.message}</p>
                </div>
            {/if}

            <div class="space-y-1.5">
                <p class="text-muted-foreground text-xs font-medium">
                    Полученный JSON:
                </p>
                <pre
                    class="bg-muted text-muted-foreground max-h-48 overflow-x-auto rounded-lg p-3 font-mono text-xs">{JSON.stringify(
                        result,
                        null,
                        2,
                    )}</pre>
            </div>
        {/if}

        <div class="space-y-2 pt-2">
            <a
                href={resolve('/health')}
                class="border-border hover:bg-accent hover:text-accent-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            >
                <ServerIcon class="size-4" />
                <span>Перейти к серверному Health Check (SSR)</span>
            </a>

            <a
                href={resolve('/')}
                class="border-border hover:bg-accent hover:text-accent-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            >
                <ArrowLeftIcon class="size-4" />
                <span>Вернуться на главную</span>
            </a>
        </div>
    </div>
</main>
