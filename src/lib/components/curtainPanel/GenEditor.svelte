<script lang="ts" context="module">
    interface GenForEditor {
        id: string;
        motherId: string;
        fatherId: string;
        information: [string, string][];
        relations: [string, string][];
    }
</script>

<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { createFloatingActions } from "svelte-floating-ui";
    import { flip, offset, shift } from "svelte-floating-ui/dom";
    import { Gen, Template, genData } from "../../store/gen";
    import {
        FATHER_ID_NAME,
        ID_NAME,
        MOTHER_ID_NAME,
    } from "../Relational.svelte";
    import { floatingStructDefault, type Floatings } from "../Floating.svelte";
    import InfoCircle from "../svg/InfoCircle.svelte";
    import Floating from "../Floating.svelte";
    import { slide } from "svelte/transition";

    const dispatch = createEventDispatcher<{ close?: void }>();

    export let editGen: Gen | undefined;
    let gen: GenForEditor = {
        id: "",
        motherId: "",
        fatherId: "",
        information: [],
        relations: [],
    };

    let isIdValid = true;
    let isMotherIdValid = true;
    let isFatherIdValid = true;

    let templateNames: string[] = [];
    const unsubscribe = genData.subscribe((v) =>
        updateTemplateNames(v.templates)
    );
    onDestroy(unsubscribe);

    let floatings: Floatings = {
        id: floatingStructDefault(),
        motherId: floatingStructDefault(),
        fatherId: floatingStructDefault(),
        information: floatingStructDefault(),
        relations: floatingStructDefault(),
    };
    for (let floating in floatings) {
        [floatings[floating].ref, floatings[floating].content] =
            createFloatingActions({
                placement: "right-start",
                strategy: "fixed",
                middleware: [offset(10), shift(), flip()],
            });
    }

    onMount(() => {
        if (editGen) {
            gen.id = editGen.id.toString();
            gen.fatherId = editGen.fatherId ? editGen.fatherId.toString() : "";
            gen.motherId = editGen.motherId ? editGen.motherId.toString() : "";
            gen.information = editGen.information.map<[string, string]>(
                ([key, value]: [string, string]) => [key.slice(), value.slice()]
            );
            gen.relations = editGen.relations.map<[string, string]>(
                ([key, value]: [string, number[]]) => [
                    key.slice(),
                    value.join(", "),
                ]
            );
        }

        validateId();
        validateMotherId();
        validateFatherId();
    });

    function updateTemplateNames(templates: Template[]) {
        templateNames = [...templates.map((value) => value.name)];
    }

    function validateId() {
        isIdValid = isInt(gen.id) && parseInt(gen.id) != 0;
    }

    function validateMotherId() {
        if (gen.motherId == "") {
            isMotherIdValid = true;
        } else if (!isInt(gen.motherId)) {
            isMotherIdValid = false;
        } else if (isIdValid && parseInt(gen.id) == parseInt(gen.motherId)) {
            isMotherIdValid = false;
        } else if (
            isFatherIdValid &&
            parseInt(gen.fatherId) == parseInt(gen.motherId)
        ) {
            isMotherIdValid = false;
        } else if (parseInt(gen.motherId) == 0) {
            isMotherIdValid = false;
        } else {
            isMotherIdValid = true;
        }
    }

    function validateFatherId() {
        if (gen.fatherId == "") {
            isFatherIdValid = true;
        } else if (!isInt(gen.fatherId)) {
            isFatherIdValid = false;
        } else if (isIdValid && parseInt(gen.id) == parseInt(gen.fatherId)) {
            isFatherIdValid = false;
        } else if (
            isMotherIdValid &&
            parseInt(gen.motherId) == parseInt(gen.fatherId)
        ) {
            isFatherIdValid = false;
        } else if (parseInt(gen.fatherId) == 0) {
            isFatherIdValid = false;
        } else {
            isFatherIdValid = true;
        }
    }

    function isInt(value: string | number): boolean {
        if (typeof value == "number") {
            value = value.toString();
        }
        return value.match(/^\d+$/) != null;
    }

    function addInformation() {
        gen.information.push(["", ""]);
        gen = gen;
    }

    function selectTemplate(name?: string) {
        if (!name) {
            gen.information = [];
        } else {
            const template = Template.findProperties(
                name,
                $genData.templates
            )?.map<[string, string]>((value: string) => [value, ""]);
            gen.information = template ?? [];
        }
        gen = gen;
    }

    function removeInformationProperty(index: number) {
        gen.information.splice(index, 1);
        gen = gen;
    }

    function addRelation() {
        gen.relations.push(["", ""]);
        gen = gen;
    }

    function isRelationsValid(line: string): boolean {
        return parseIntArray(line) != undefined;
    }

    function removeRelation(index: number) {
        gen.relations.splice(index, 1);
        gen = gen;
    }

    function close() {
        dispatch("close");
    }

    function save() {
        if (isAllValid(gen)) {
            let genTransformed = new Gen();
            genTransformed.id = parseInt(gen.id);
            genTransformed.motherId = parseInt(gen.motherId);
            genTransformed.fatherId = parseInt(gen.fatherId);
            genTransformed.information = gen.information.filter(([k, _]) => {
                return ![ID_NAME, MOTHER_ID_NAME, FATHER_ID_NAME].includes(k);
            });
            gen.relations.forEach((value) => {
                const array = parseIntArray(value[1]);
                if (array) {
                    genTransformed.relations.push([value[0], array]);
                }
            });
            genData.saveGen(genTransformed, editGen?.id);
            dispatch("close");
        }
    }

    function isAllValid(gen: GenForEditor): boolean { // Even though I can refer to gen directly, I'm doing this trick for reactivity.
        return (
            isIdValid &&
            isMotherIdValid &&
            isFatherIdValid &&
            gen.relations.every(([_, line]) => isRelationsValid(line))
        );
    }

    function parseIntArray(line: string): number[] | undefined {
        const strNumbers: string[] = line
            .split(",")
            .map((value: string) => value.trim());
        if (strNumbers.some((value: string) => !isInt(value))) {
            return undefined;
        } else {
            return strNumbers.map((value: string) => parseInt(value));
        }
    }

    function validate(
        node: HTMLElement,
        args: { value: string; validateFn: () => void }
    ) {
        return {
            update(args: { value: string; validateFn: () => void }) {
                args.validateFn();
            },
        };
    }
</script>

<div class="host">
    <span class="text-body-secondary"
        >Внимание! Если вы сохраните человека с уже существующим id, то старый
        будет полностью заменен новым.</span
    >
    <div id="id-input">
        <div>
            <div class="my-2 d-flex">
                <span class="mx-1 h5">ID</span>
                <div
                    class="d-inline"
                    use:floatings.id.ref
                    on:mouseenter={() => (floatings.id.show = true)}
                    on:mouseleave={() => (floatings.id.show = false)}
                >
                    <InfoCircle />
                </div>
            </div>
            <input
                type="text"
                class="form-control"
                class:is-invalid={!isIdValid}
                bind:value={gen.id}
                use:validate={{ value: gen.id, validateFn: validateId }}
                placeholder="ID"
            />
            <div class="invalid-feedback">
                ID должен быть натуральным числом
            </div>
        </div>
        <div>
            <div class="my-2 d-flex">
                <span class="mx-1 h5">ID Матери</span>
                <div
                    class="d-inline"
                    use:floatings.motherId.ref
                    on:mouseenter={() => (floatings.motherId.show = true)}
                    on:mouseleave={() => (floatings.motherId.show = false)}
                >
                    <InfoCircle />
                </div>
            </div>
            <input
                type="text"
                class="form-control"
                class:is-invalid={!isMotherIdValid}
                bind:value={gen.motherId}
                use:validate={{
                    value: gen.motherId,
                    validateFn: validateMotherId,
                }}
                placeholder="ID Матери"
            />
            <div class="invalid-feedback">
                ID матери не должен совпадать с ID ребенка или ID отца. Также он
                должен быть натуральным числом
            </div>
        </div>
        <div>
            <div class="my-2 d-flex">
                <span class="mx-1 h5">ID Отца</span>
                <div
                    class="d-inline"
                    use:floatings.fatherId.ref
                    on:mouseenter={() => (floatings.fatherId.show = true)}
                    on:mouseleave={() => (floatings.fatherId.show = false)}
                >
                    <InfoCircle />
                </div>
            </div>
            <input
                type="text"
                class="form-control"
                class:is-invalid={!isFatherIdValid}
                bind:value={gen.fatherId}
                use:validate={{
                    value: gen.fatherId,
                    validateFn: validateFatherId,
                }}
                placeholder="ID Отца"
            />
            <div class="invalid-feedback">
                ID отца не должен совпадать с ID ребенка или ID матери. Также он
                должен быть натуральным числом
            </div>
        </div>
    </div>
    <div id="gen-information">
        <span class="h5">Информация</span>
        <div
            class="d-inline"
            use:floatings.information.ref
            on:mouseenter={() => (floatings.information.show = true)}
            on:mouseleave={() => (floatings.information.show = false)}
        >
            <InfoCircle />
        </div>
        <button class="btn btn-primary ms-auto" on:click={addInformation}
            >Добавить поле</button
        >
        <div class="dropdown" style:position="static">
            <button
                class="btn btn-outline-secondary dropdown-toggle"
                data-bs-toggle="dropdown">Шаблоны</button
            >
            <ul class="dropdown-menu">
                <li>
                    <button
                        class="dropdown-item"
                        on:click={() => selectTemplate()}>Пустой шаблон</button
                    >
                </li>
                {#each templateNames as name, i}
                    <li>
                        <button
                            class="dropdown-item"
                            on:click={() => selectTemplate(name)}>{name}</button
                        >
                    </li>
                {/each}
            </ul>
        </div>
    </div>
    {#each gen.information as property, i (i)}
        <div class="input-group" in:slide>
            <input
                class="form-control"
                bind:value={property[0]}
                placeholder="Название характеристики"
            />
            <span class="input-group-text">:</span>
            <input
                class="form-control"
                bind:value={property[1]}
                placeholder="Значение характеристики"
            />
            <button
                class="btn btn-danger"
                on:click={() => removeInformationProperty(i)}>Убрать</button
            >
        </div>
    {/each}
    <div id="gen-relations">
        <span class="h5">Связи с другими людьми</span>
        <div
            class="d-inline"
            use:floatings.relations.ref
            on:mouseenter={() => (floatings.relations.show = true)}
            on:mouseleave={() => (floatings.relations.show = false)}
        >
            <InfoCircle />
        </div>
        <button class="btn btn-primary ms-auto" on:click={addRelation}
            >Добавить поле</button
        >
    </div>
    {#each gen.relations as relation, i (i)}
        <div in:slide>
            <div class="input-group">
                <input
                    class="form-control"
                    bind:value={relation[0]}
                    placeholder="Название связи"
                />
                <span class="input-group-text">:</span>
                <input
                    class="form-control"
                    bind:value={relation[1]}
                    class:is-invalid={!isRelationsValid(relation[1])}
                    placeholder="ID'ы через запятую"
                />
                <button
                    class="btn btn-danger"
                    on:click={() => removeRelation(i)}>Убрать</button
                >
            </div>
            {#if !isRelationsValid(relation[1])}
                <div class="invalid-feedback d-block">
                    Через запятую должны быть перечислены ID'ы, то есть натуральные
                    числа
                </div>
            {/if}
        </div>
    {/each}
    <div id="gen-decision-panel">
        <button class="btn btn-outline-danger" on:click={close}>Отмена</button>
        <button
            class="btn btn-success"
            class:disabled={!isAllValid(gen)}
            on:click={save}>Сохранить</button
        >
    </div>
</div>

{#if floatings.id.show}
    <Floating contentAction={floatings.id.content}>
        ID - это уникальный идентификатора человека. Его можно указать в
        предустановленных связях (ID матери и отца), а также в каких-нибудь
        своих ("Связи").<br />
        Рекомендуется начать отчёт с 1 и для каждой новой ветви добавлять единицу
        (1, 2, 3 и т.д.).
    </Floating>
{/if}

{#if floatings.motherId.show}
    <Floating contentAction={floatings.motherId.content}>
        ID Матери - это ID женщины, являющейся матерью для этого человека.<br />
        Например, если вы создаете человека с ID 3 и матерью для него является женщина
        с ID 1, следует написать здесь 1.
    </Floating>
{/if}

{#if floatings.fatherId.show}
    <Floating contentAction={floatings.fatherId.content}>
        ID Отца - это ID мужчины, являющегося отцом для этого человека.<br />
        Например, если вы создаете человека с ID 3 и отцом для него является мужчина
        с ID 2, следует написать здесь 2.
    </Floating>
{/if}

{#if floatings.information.show}
    <Floating contentAction={floatings.information.content}>
        Дополнительная информация о человеке в любом формате. Например это может
        быть "Профессия", "Дата рождения" или даже "Номер телефона".<br />
        Она также появится в таблице в виде столбцов.
    </Floating>
{/if}

{#if floatings.relations.show}
    <Floating contentAction={floatings.relations.content}>
        Связи человека с другими людьми.<br />
        Например, можно создать связь "Брат", а в качестве значения перечислить ID'ы
        тех людей, кто является братом создаваемому человеку.<br />
        Необязательно указывать родственные связи - они могут быть любыми, например,
        "Наследник" или "С кем плохие отношения".
    </Floating>
{/if}

<style lang="scss">
    @import "../../../util.scss";

    .host {
        display: grid;
        row-gap: 10px;
        padding: 15px;
        overflow-y: scroll;
        max-height: 100%;
        @include hide-scroll();

        #id-input {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            column-gap: 10px;
        }

        #gen-information {
            display: flex;
            align-items: center;
            column-gap: 5px;
            margin-top: 15px;
        }

        #gen-relations {
            display: flex;
            align-items: center;
            column-gap: 5px;
            margin-top: 15px;
        }

        #gen-decision-panel {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 10px;
            margin-top: 15px;
        }
    }
</style>
