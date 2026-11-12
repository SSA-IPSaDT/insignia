<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="container">
    <header>
        <p>
            <strong>Insignia API</strong> • Реестр ошибок RFC 9457
        </p>
        <nav>
            <a href="/problems">Каталог проблем</a> •
            <a href="/docs">Scalar API</a> •
            <a
                href="https://www.rfc-editor.org/rfc/rfc9457"
                target="_blank"
                rel="noreferrer"
            >
                RFC 9457 ↗
            </a>
        </nav>
        <hr />
    </header>

    <main>
        {#if children}
            {@render children()}
        {/if}
    </main>

    <footer>
        <hr />
        <p>
            Платформа Insignia • Машиночитаемая спецификация ошибок{' '}
            <a
                href="https://www.rfc-editor.org/rfc/rfc9457"
                target="_blank"
                rel="noreferrer"
            >
                RFC 9457 Problem Details
            </a>
        </p>
    </footer>
</div>
