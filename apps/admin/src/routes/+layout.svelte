<script lang="ts">
    import '#styles';
    import { ModeWatcher } from 'mode-watcher';

    import { Toaster } from '#components';
    import favicon from '#lib/assets/favicon.svg';

    import type { LayoutProps } from './$types';

    let { children }: LayoutProps = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster richColors position="top-right" />

{@render children()}
