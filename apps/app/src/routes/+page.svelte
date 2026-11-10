<script lang="ts">
    import { Button } from '#lib/components/ui/button';
</script>

<main
    class="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center"
>
    <h1 class="text-3xl font-bold tracking-tight">Insignia Client App</h1>
    <p class="text-muted-foreground max-w-md">
        Клиентское мультиплатформенное приложение Insignia (Mini App / PWA) на
        базе Svelte 5, Tailwind CSS v4 и shadcn-svelte.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3">
        <Button href="/health" variant="default">
            Проверить статус API (Health)
        </Button>
        <Button
            href="https://svelte.dev/docs/kit"
            variant="outline"
            target="_blank"
            rel="noreferrer"
        >
            Документация SvelteKit
        </Button>
    </div>
</main>
