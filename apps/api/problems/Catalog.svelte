<script lang="ts">
    import type { CatalogPageProps } from './types';

    let { problems = [] }: CatalogPageProps = $props();
</script>

<div>
    <h1>Каталог спецификаций проблем API</h1>
    <p>
        Каноничные машиночитаемые типы проблем платформы Insignia в соответствии
        со стандартом
        <a
            href="https://www.rfc-editor.org/rfc/rfc9457"
            target="_blank"
            rel="noreferrer">RFC 9457 Problem Details</a
        >. Каждый тип ошибки имеет стабильный URI, неизменяемый машиночитаемый
        код и рекомендации по исправлению.
    </p>

    <ul class="problems-list">
        {#each problems as item}
            <li class="problem-item">
                <p>
                    <a href="/problems/{item.slug}"
                        ><strong>{item.title}</strong></a
                    >
                    — <code>{item.code}</code> (HTTP {item.status}{#if item.categoryLabel},
                        {item.categoryLabel}{/if})
                </p>
                <p>{item.summary}</p>
                <p>
                    <small
                        >Спецификация типа: <code>/problems/{item.slug}</code
                        ></small
                    >
                </p>
            </li>
        {/each}
    </ul>
</div>
