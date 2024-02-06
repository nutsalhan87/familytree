<script lang="ts" context="module">
    import { genData, type Template } from "../../store/gen";

    export interface TemplateEditData {
        template: Template;
        oldName: string | undefined;
    }
</script>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { createFloatingActions } from "svelte-floating-ui";
    import { offset, shift, flip } from "svelte-floating-ui/core";
    import { slide } from "svelte/transition";
    import { floatingStructDefault, type Floatings } from "../Floating.svelte";
    import InfoCircle from "../svg/InfoCircle.svelte";
    import Floating from "../Floating.svelte";

    const dispatch = createEventDispatcher<{ close?: void }>();

    export let templateEditData: TemplateEditData;
    $: isNameValid = templateEditData.template.name ? true : false;

    let floatings: Floatings = {
        templateName: floatingStructDefault(),
        properties: floatingStructDefault(),
    };
    for (let floating in floatings) {
        [floatings[floating].ref, floatings[floating].content] =
            createFloatingActions({
                placement: "right-start",
                strategy: "fixed",
                middleware: [offset(10), shift(), flip()],
            });
    }

    function addProperty() {
        templateEditData.template.properties.push("");
        templateEditData = templateEditData;
    }

    function removeProperty(index: number) {
        templateEditData.template.properties.splice(index, 1);
        templateEditData = templateEditData;
    }

    function close() {
        dispatch("close");
    }

    function save() {
        if (isNameValid) {
            genData.saveTemplate(
                templateEditData.template,
                templateEditData.oldName
            );
            dispatch("close");
        }
    }
</script>

<div class="host">
    <div style:margin-bottom={"-5px"}>
        <span class="h5">Название шаблона</span>
        <div
            class="d-inline"
            use:floatings.templateName.ref
            on:mouseenter={() => (floatings.templateName.show = true)}
            on:mouseleave={() => (floatings.templateName.show = false)}
        >
            <div class="d-inline mx-2">
                <InfoCircle />
            </div>
        </div>
    </div>
    <input
        type="text"
        class="form-control"
        class:is-invalid={!isNameValid}
        bind:value={templateEditData.template.name}
    />
    <div class="invalid-feedback" style:margin-top={"-10px"}>
        Введите название шаблона
    </div>
    <div style:margin-bottom={"-5px"}>
        <span class="h5">Свойства</span>
        <div
            class="d-inline"
            use:floatings.properties.ref
            on:mouseenter={() => (floatings.properties.show = true)}
            on:mouseleave={() => (floatings.properties.show = false)}
        >
            <div class="d-inline mx-2">
                <InfoCircle />
            </div>
        </div>
    </div>
    {#each templateEditData.template.properties as _, i (i)}
        <div class="input-group" in:slide={{ duration: 200 }}>
            <input
                class="form-control"
                bind:value={templateEditData.template.properties[i]}
            />
            <button class="btn btn-danger" on:click={() => removeProperty(i)}
                >Убрать</button
            >
        </div>
    {/each}
    <button class="btn btn-primary" on:click={addProperty}
        >Добавить свойство</button
    >
    <div id="template-decision-panel">
        <button class="btn btn-outline-danger" on:click={() => close()}
            >Отмена</button
        >
        <button
            class="btn btn-success"
            class:disabled={!isNameValid}
            on:click={save}>Сохранить</button
        >
    </div>
</div>

{#if floatings.templateName.show}
    <Floating contentAction={floatings.templateName.content}>
        Например, 'ФИО' или 'Историческая личность'.
    </Floating>
{/if}

{#if floatings.properties.show}
    <Floating contentAction={floatings.properties.content}>
        Например, 'Работа', 'Имя', 'Прозвище' и т.д.
    </Floating>
{/if}

<style lang="scss">
    @import "../../../util.scss";

    .host {
        max-height: 100%;
        display: grid;
        row-gap: 10px;
        padding: 15px;
        overflow-y: scroll;
        @include hide-scroll();

        #template-decision-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 10px;
        }
    }
</style>
