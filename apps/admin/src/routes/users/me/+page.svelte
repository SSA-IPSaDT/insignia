<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import type { UserDto } from '@insignia/contracts';
    import { createInsigniaClient } from '@insignia/sdk';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    const api = createInsigniaClient({
        auth: '01a1bdc5-72fc-748f-9b7c-0095e620814e',
    });

    let user = $state<UserDto>();
    const updatedYear = $derived(
        user?.updatedAt.toZonedDateTimeISO(Temporal.Now.timeZoneId()).year,
    );
    const formattedUpdatedAt = $derived(
        user?.updatedAt.toLocaleString('ru-RU', {
            timeZone: Temporal.Now.timeZoneId(),
            dateStyle: 'long',
            timeStyle: 'short',
        }),
    );

    onMount(async () => {
        const result = await api.users.me();
        if (result.success) {
            user = result.data;
        }
    });
</script>

{#if user}
    <div>
        <p>Год обновления: <strong>{updatedYear}</strong></p>
        <p>Дата и время: <strong>{formattedUpdatedAt}</strong></p>
    </div>
{/if}
