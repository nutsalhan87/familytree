<script lang="ts">
    import { Template, genData } from "../../store/gen";
    import { createEventDispatcher, onDestroy } from "svelte";
    import { createFloatingActions } from "svelte-floating-ui";
    import { offset, shift, flip } from "svelte-floating-ui/dom";
    import InfoCircle from "../svg/InfoCircle.svelte";
    import type { TemplateEditData } from "./TemplateEditor.svelte";
    import Floating, {
        floatingStructDefault,
        type FloatingStruct,
    } from "../Floating.svelte";

    const dispatch = createEventDispatcher<{
        edit?: TemplateEditData;
        close?: void;
    }>();

    let templates: Template[] = [];
    const unsubscribe = genData.subscribe((v) => {
        templates = [...v.templates];
    });
    onDestroy(unsubscribe);

    let templateInfo: FloatingStruct = floatingStructDefault();
    [templateInfo.ref, templateInfo.content] = createFloatingActions({
        placement: "left-start",
        strategy: "fixed",
        middleware: [offset(10), shift(), flip()],
    });

    function newTemplate() {
        dispatch("edit", {
            template: { name: "", properties: [] },
            oldName: undefined,
        });
    }

    function edit(name: string) {
        let editData: TemplateEditData = {
            template: {
                name,
                properties: [],
            },
            oldName: name,
        };
        const properties = Template.findProperties(name, templates);
        if (properties) {
            editData.template.properties = [...properties];
        }
        dispatch("edit", editData);
    }

    function deleteTemplate(name: string) {
        genData.deleteTemplate(name);
    }
</script>

<div class="host">
    <div id="control">
        <button class="btn btn-primary" on:click={newTemplate}
            >Новый шаблон</button
        >
        <div
            class="d-inline"
            use:templateInfo.ref
            on:mouseenter={() => (templateInfo.show = true)}
            on:mouseleave={() => (templateInfo.show = false)}
        >
            <InfoCircle sideSize={1.5} />
        </div>
    </div>
    <div class="accordion" id="templates-accordion">
        {#each templates as template, i}
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#template-collapse{i}"
                        aria-expanded="false"
                        aria-controls="template-collapse{i}"
                        >{template.name}</button
                    >
                </h2>
                <div
                    id="template-collapse{i}"
                    class="accordion-collapse collapse"
                    data-bs-parent="#templates-accordion"
                >
                    <div class="accordion-body">
                        <table class="table table-borderless">
                            <tbody>
                                {#each template.properties as property}
                                    <tr><td>{property}</td></tr>
                                {/each}
                            </tbody>
                        </table>
                        <div class="row">
                            <button
                                class="col btn btn-danger mx-3"
                                on:click={() => deleteTemplate(template.name)}
                                >Удалить</button
                            >
                            <button
                                class="col btn btn-success mx-3"
                                on:click={() => edit(template.name)}
                                >Изменить</button
                            >
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

{#if templateInfo.show}
    <Floating contentAction={templateInfo.content}>
        Шаблоны позволяют не тратить время на ручной набор названий столбцов,
        которые вы хотите добавить в информацию о человеке.<br />
        Например, можно создать шаблон ФИО, который при добавлении создаст столбцы
        "Фамилия", "Имя" и "Отчество" - вводить вручную их больше не придется.
    </Floating>
{/if}

<style lang="scss">
    @import "../../../util.scss";

    .host {
        max-height: 100%;
        display: block;
        overflow-y: scroll;
        padding: 15px;
        @include hide-scroll();

        #control {
            display: flex;
            margin-bottom: 15px;

            :last-child {
                display: inline-block;
                margin-left: auto;
            }
        }
    }
</style>
