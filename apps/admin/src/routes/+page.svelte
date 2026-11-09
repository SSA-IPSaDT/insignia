<script lang="ts">
    import { resolve } from '$app/paths';
    import ActivityIcon from '@lucide/svelte/icons/activity';
    import BellIcon from '@lucide/svelte/icons/bell';
    import MoonIcon from '@lucide/svelte/icons/moon';
    import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
    import SunIcon from '@lucide/svelte/icons/sun';
    import UserIcon from '@lucide/svelte/icons/user';
    import { mode, toggleMode } from 'mode-watcher';
    import { toast } from 'svelte-sonner';

    const notify = (): void => {
        toast.success('Insignia Admin Framework initialized successfully!', {
            description:
                'SvelteKit, Tailwind CSS v4, Hooks & UI components are ready.',
        });
    };
</script>

<main
    class="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6"
>
    <div
        class="bg-card text-card-foreground border-border w-full max-w-md space-y-6 rounded-xl border p-8 shadow-sm"
    >
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <ShieldCheckIcon class="text-primary size-7" />
                <div>
                    <h1 class="text-xl font-bold tracking-tight">
                        Insignia Admin
                    </h1>
                    <p class="text-muted-foreground text-xs">
                        Admin Control Panel
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
            Базовый каркас панели администратора развернут: Svelte 5, SvelteKit,
            Bun Adapter, Tailwind CSS v4, Server/Client Hooks, Toaster и Mode
            Watcher.
        </p>

        <div class="pt-2">
            <button
                type="button"
                onclick={notify}
                class="bg-primary text-primary-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
                <BellIcon class="size-4" />
                <span>Проверить уведомление</span>
            </button>
        </div>

        <div class="pt-1">
            <a
                href={resolve('/health')}
                class="border-border hover:bg-accent hover:text-accent-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            >
                <ActivityIcon class="size-4" />
                <span>Проверить статус API (Health Check)</span>
            </a>
        </div>
        <div class="pt-1">
            <a
                href={resolve('/users')}
                class="border-border hover:bg-accent hover:text-accent-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
            >
                <UserIcon class="size-4" />
                <span>Просмотреть пользователей</span>
            </a>
        </div>
    </div>
</main>
