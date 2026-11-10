<script lang="ts">
    import '../app.css';

    import { ModeWatcher } from 'mode-watcher';

    import favicon from '#lib/assets/favicon.svg';
    import { initPlatform, useThemeSync } from '#lib/platform';

    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();

    $effect(() => {
        initPlatform();
    });

    useThemeSync();
</script>

<ModeWatcher />

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
