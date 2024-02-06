<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Gen } from "../../store/gen";

    const dispatch = createEventDispatcher<{ close?: void }>();

    export let gen: Gen;

    function close() {
        dispatch("close");
    }
</script>

<div class="host">
    <div>
        <button class="btn btn-outline-danger" on:click={close}>Закрыть</button>
    </div>
    <div id="id-info">
        <div class="d-grid">
            <span class="h3">ID</span>
            <span class="display-6">{gen.id}</span>
        </div>
        <div class="d-grid">
            <span class="h3">ID Матери</span>
            <span class="display-6">{gen.motherId ?? ''}</span>
        </div>
        <div class="d-grid">
            <span class="h3">ID Отца</span>
            <span class="display-6">{gen.fatherId ?? ''}</span>
        </div>
    </div>
    <div id="info-information">
        <span class="h3">Информация</span>
        {#each gen.information as info}
            <span class="fs-5">{info[0] + ": " + info[1]}</span>
        {:else}
            <span class="secondary-text">Ничего нет</span>
        {/each}
    </div>
    <div id="info-relations">
        <span class="h3">Отношения</span>
        {#each gen.relations as rels}
            <span class="fs-5">{rels[0] + ": " + rels[1].join(", ")}</span>
        {:else}
            <span class="secondary-text">Ничего нет</span>
        {/each}
    </div>
</div>

<style lang="scss">
    @import "../../../util.scss";

    .host {
        display: grid;
        row-gap: 30px;
        padding: 15px;
        overflow-y: scroll;
        max-height: 100%;
        @include hide-scroll();

        #id-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
        }

        #info-information {
            display: grid;
        }

        #info-relations {
            display: grid;
        }
    }
</style>
