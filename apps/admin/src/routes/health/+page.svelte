<script lang="ts">
    import { resolve } from '$app/paths';
    import ActivityIcon from '@lucide/svelte/icons/activity';
    import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
    import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
    import GlobeIcon from '@lucide/svelte/icons/globe';
    import MoonIcon from '@lucide/svelte/icons/moon';
    import SunIcon from '@lucide/svelte/icons/sun';
    import XCircleIcon from '@lucide/svelte/icons/x-circle';
    import { mode, toggleMode } from 'mode-watcher';

    import type { PageData } from './$types';

    const { data }: { data: PageData } = $props();
</script>

<main
    class="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6"
>
    <div
        class="bg-card text-card-foreground border-border w-full max-w-lg space-y-6 rounded-xl border p-8 shadow-sm"
    >
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <ActivityIcon class="text-primary size-7" />
                <div>
                    <h1 class="text-xl font-bold tracking-tight">
                        Статус API (SSR)
                    </h1>
                    <p class="text-muted-foreground text-xs">
                        Проверка через Insignia SDK на стороне сервера
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

        {#if data.result.success}
            <div
                class="border-border bg-accent/30 space-y-3 rounded-lg border p-4"
            >
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Общее состояние:</span>
                    <span
                        class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                        <CheckCircle2Icon class="size-3.5" />
                        {data.result.data.status.toUpperCase()}
                    </span>
                </div>

                <div
                    class="text-muted-foreground grid grid-cols-2 gap-2 text-xs"
                >
                    <div>
                        <span class="text-foreground font-medium">Аптайм:</span>
                        {data.result.data.uptime} с
                    </div>
                    <div>
                        <span class="text-foreground font-medium"
                            >БД (PostgreSQL):</span
                        >
                        {data.result.data.services.database}
                    </div>
                    <div class="col-span-2 truncate">
                        <span class="text-foreground font-medium"
                            >Время ответа:</span
                        >
                        {data.result.data.timestamp}
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
                        >[{data.result.error.type.toUpperCase()}] {data.result
                            .error.code} (HTTP {data.result.error.status})</span
                    >
                </div>
                <p class="text-muted-foreground">{data.result.error.message}</p>
            </div>
        {/if}

        <div class="space-y-1.5">
            <p class="text-muted-foreground text-xs font-medium">
                Ответ API (JSON):
            </p>
            <pre
                class="bg-muted text-muted-foreground max-h-48 overflow-x-auto rounded-lg p-3 font-mono text-xs">{JSON.stringify(
                    data.result,
                    null,
                    2,
                )}</pre>
        </div>

        <div class="space-y-2 pt-2">
            <a
                href={resolve('/health/client')}
                class="bg-primary text-primary-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
                <GlobeIcon class="size-4" />
                <span>Проверить через браузер (Client Check)</span>
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
