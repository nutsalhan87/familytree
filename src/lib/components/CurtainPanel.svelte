<script lang="ts" context="module">
    export enum CurtainPanelContent {
        NoContent,
        TemplateManager,
        TemplateEditor,
        GenEditor,
        GenInfo,
    }
</script>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { backOut } from "svelte/easing";
    import type { Gen } from "../store/gen";
    import TemplateManager from "./curtainPanel/TemplateManager.svelte";
    import TemplateEditor, {
        type TemplateEditData,
    } from "./curtainPanel/TemplateEditor.svelte";
    import GenInfo from "./curtainPanel/GenInfo.svelte";
    import GenEditor from "./curtainPanel/GenEditor.svelte";

    const dispatch = createEventDispatcher<{ close?: void }>();

    export let content: CurtainPanelContent;
    export let gen: Gen | undefined;
    let templateEditData: TemplateEditData = {
        template: { name: "", properties: [] },
        oldName: undefined,
    };

    function editTemplate(newTemplateEditData: TemplateEditData) {
        templateEditData = newTemplateEditData;
        content = CurtainPanelContent.TemplateEditor;
    }

    function openTemplateManager() {
        content = CurtainPanelContent.TemplateManager;
    }

    function close() {
        dispatch("close");
    }
</script>

<div class="host">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div id="curtain" on:click={close} transition:fade={{ duration: 200 }} />
    <div
        id="panel"
        class="shadow bg-body"
        transition:scale={{ easing: backOut }}
    >
        {#if content == CurtainPanelContent.TemplateManager}
            <TemplateManager on:close on:edit={(v) => editTemplate(v.detail)} />
        {:else if content == CurtainPanelContent.TemplateEditor}
            <TemplateEditor on:close={openTemplateManager} {templateEditData} />
        {:else if content == CurtainPanelContent.GenEditor}
            <GenEditor on:close editGen={gen} />
        {:else if content == CurtainPanelContent.GenInfo}
            <GenInfo on:close {gen} />
        {/if}
    </div>
</div>

<style lang="scss">
    .host {
        position: fixed;
        top: 0;

        #curtain {
            position: fixed;
            width: 100vw;
            height: 100vh;
            background-color: #00000060;
        }

        #panel {
            --w: 800px;
            --h: 600px;
            position: fixed;
            left: calc(50vw - var(--w) / 2);
            top: calc(50vh - var(--h) / 2);
            width: var(--w);
            height: var(--h);
            border-radius: 15px;

            @media screen and (max-width: 800px), (max-height: 720px) {
                left: 0;
                top: var(--t);
                width: 100%;
                height: calc(100% - var(--t));
                border-radius: 0;
            }
        }
    }
</style>
