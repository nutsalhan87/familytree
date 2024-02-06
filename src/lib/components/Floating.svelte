<script lang="ts" context="module">
    export interface FloatingStruct {
        show: boolean;
        ref: ReferenceAction;
        content: ContentAction;
    }

    export function floatingStructDefault(): FloatingStruct {
        return {
            show: false,
            ref: undefined,
            content: undefined,
        };
    }

    export type Floatings = Record<string, FloatingStruct>;
</script>

<script lang="ts">
    import type { ContentAction, ReferenceAction } from "svelte-floating-ui";
    import { scale } from "svelte/transition";

    export let contentAction: ContentAction;
    export let maxWidth: string = "300px";
</script>

<span
    class="bg-body rounded shadow p-3 position-fixed"
    style:max-width={maxWidth}
    style:z-index={999}
    use:contentAction
    transition:scale
>
    <slot />
</span>
