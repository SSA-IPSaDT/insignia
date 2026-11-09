<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import type { PublicUserDto } from '@insignia/contracts';
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';

    import api from '#lib/api';

    let user = $state<PublicUserDto>();
    let userId = $derived(page.params.id ?? '');

    onMount(async () => {
        const result = await api.users.takeUserById(userId);

        if (result.success) {
            toast.success('Ответ от API успешно получен в браузере!');
            user = result.data;
        } else {
            toast.error(`[${result.error.code}] ${result.error.message}`);
        }
    });
</script>

<pre>
<code>
{JSON.stringify(user, undefined, 4)}
</code>
</pre>
