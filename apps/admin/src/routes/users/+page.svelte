<script lang="ts">
    import { resolve } from '$app/paths';
    import type { PublicUserDto } from '@insignia/contracts';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    import api from '#lib/api';

    let users = $state<PublicUserDto[]>([]);

    onMount(async () => {
        const result = await api.users.takeUsers({
            limit: 10,
        });

        if (result.success) {
            toast.success('Ответ от API успешно получен в браузере!');
            users = result.data.items;
        } else {
            toast.error(`[${result.error.code}] ${result.error.message}`);
        }
    });
</script>

{#each users as user (user.id)}
    <div class="pb-3">
        <p>{user.id}</p>
        {#if user.avatarUrl}
            <img src={user.avatarUrl} alt="" width="70" height="70" />
        {:else}
            <p>Аватара нет</p>
        {/if}
        <p>{user.lastName || 'Нет фамилии'}</p>
        <p>{user.firstName}</p>
        <p>{user.patronymic || 'Нет отчества'}</p>
        <p>{user.userName || 'Нет имени пользователя'}</p>
        <a
            href={resolve('/users/[id=uuid]', {
                id: user.id,
            })}>Посмотреть профиль</a
        >
    </div>
{:else}
    <p>Пользователей нет</p>
{/each}
