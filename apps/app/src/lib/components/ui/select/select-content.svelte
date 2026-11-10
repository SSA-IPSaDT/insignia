<script lang="ts">
    import { Select as SelectPrimitive } from 'bits-ui';
    import type { ComponentProps } from 'svelte';

    import { cn, type WithoutChild } from '#lib/utils.js';
    import type { WithoutChildrenOrChild } from '#lib/utils.js';

    import SelectPortal from './select-portal.svelte';
    import SelectScrollDownButton from './select-scroll-down-button.svelte';
    import SelectScrollUpButton from './select-scroll-up-button.svelte';

    let {
        ref = $bindable(null),
        class: className,
        sideOffset = 4,
        portalProps,
        children,
        preventScroll = true,
        ...restProps
    }: WithoutChild<SelectPrimitive.ContentProps> & {
        portalProps?: WithoutChildrenOrChild<
            ComponentProps<typeof SelectPortal>
        >;
    } = $props();
</script>

<SelectPortal {...portalProps}>
    <SelectPrimitive.Content
        bind:ref
        {sideOffset}
        {preventScroll}
        data-slot="select-content"
        class={cn(
            'text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 dark bg-popover/70 **:data-[slot$=-item]:focus:bg-foreground/10 **:data-[slot$=-item]:data-highlighted:bg-foreground/10 **:data-[slot$=-separator]:bg-foreground/5 **:data-[slot$=-trigger]:focus:bg-foreground/10 **:data-[slot$=-trigger]:aria-expanded:bg-foreground/10! **:data-[variant=destructive]:focus:bg-foreground/10! **:data-[variant=destructive]:text-accent-foreground! **:data-[variant=destructive]:**:text-accent-foreground! relative z-50 max-h-(--bits-select-content-available-height) min-w-36 origin-(--bits-select-content-transform-origin) animate-none! overflow-x-hidden overflow-y-auto rounded-md shadow-md ring-1 duration-100 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150',
            className,
        )}
        {...restProps}
    >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
            class={cn(
                'h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-1',
            )}
        >
            {@render children?.()}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
    </SelectPrimitive.Content>
</SelectPortal>
