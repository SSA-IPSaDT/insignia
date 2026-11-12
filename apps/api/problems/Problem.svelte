<script lang="ts">
    import type { ProblemPageProps } from './types';

    let {
        title,
        code,
        status,
        slug,
        summary,
        description,
        categoryLabel = '',
        causes = [],
        remediation = [],
        architectureNotes = [],
        relatedEndpoints = [],
        examplePayload,
        canonicalUrl = '',
    }: ProblemPageProps = $props();

    const actorLabels: Record<string, string> = {
        client: 'Клиент',
        developer: 'Разработчик',
        admin: 'Администратор',
        devops: 'DevOps',
    };
</script>

<article>
    <header>
        <p>
            <strong>HTTP {status}</strong> •
            <code>{code}</code>{#if categoryLabel}
                • {categoryLabel}{/if}
        </p>
        <h1>{title}</h1>
        <p>{summary}</p>
    </header>

    <p>
        <strong>Каноничный идентификатор типа проблемы (RFC 9457 type):</strong
        ><br />
        <code>{canonicalUrl || `/problems/${slug}`}</code>
    </p>

    {#if description}
        <section>
            <h2>Подробное описание проблемы</h2>
            <p>{description}</p>
        </section>
    {/if}

    {#if causes.length > 0}
        <section>
            <h2>Причины возникновения</h2>
            <ul>
                {#each causes as cause}
                    <li>{cause}</li>
                {/each}
            </ul>
        </section>
    {/if}

    {#if remediation.length > 0}
        <section>
            <h2>Как устранить ошибку (Remediation)</h2>
            <ol>
                {#each remediation as step}
                    <li>
                        <strong
                            >[{actorLabels[step.actor] || step.actor}] {step.title}</strong
                        >:
                        {step.description}
                    </li>
                {/each}
            </ol>
        </section>
    {/if}

    {#if architectureNotes.length > 0}
        <section>
            <h2>Особенности архитектуры Insignia</h2>
            <ul>
                {#each architectureNotes as note}
                    <li>{note}</li>
                {/each}
            </ul>
        </section>
    {/if}

    {#if examplePayload}
        <section>
            <h2>Пример ответа API (Wire JSON Payload)</h2>
            <pre><code>{JSON.stringify(examplePayload, null, 2)}</code></pre>
        </section>
    {/if}

    {#if relatedEndpoints.length > 0}
        <section>
            <h2>Связанные эндпоинты API</h2>
            <ul>
                {#each relatedEndpoints as ep}
                    <li><code>{ep}</code></li>
                {/each}
            </ul>
        </section>
    {/if}

    <p style="margin-top: 2rem;">
        <a href="/problems">← Вернуться в общий каталог проблем API</a>
    </p>
</article>
