<script lang="ts" context="module">
    export const ID_NAME = "ID";
    export const MOTHER_ID_NAME = "ID Матери";
    export const FATHER_ID_NAME = "ID Отца";
</script>

<script lang="ts">
    import { createEventDispatcher, onDestroy } from "svelte";
    import { type Gen, genData } from "../store/gen";
    import CaretDownFill from './svg/CaretDownFill.svelte';
    import CaretUpFill from './svg/CaretUpFill.svelte';

    const dispatch = createEventDispatcher<{
        edit?: Gen;
        infoShow?: Gen;
    }>();

    let sorting: [string, "as" | "des"] = [ID_NAME, "as"];
    let cols: string[] = [];
    let gens: Gen[] = [];

    const unsubscribe = genData.subscribe((v) => {
        updateData(v.gens);
    });
    onDestroy(unsubscribe);

    function updateData(newGens: Gen[]) {
        gens = [...newGens];
        resortGens();
        let tempCols: string[] = [];
        for (let gen of gens) {
            tempCols.push(...gen.information.map(([col, _]) => col));
        }
        cols = [...new Set(tempCols)].sort();
    }

    function compareWithUndefinedMore(
        a: any,
        b: any,
        f: (a: any, b: any) => number
    ) {
        if (a != undefined && b != undefined) {
            return f(a, b);
        } else if (a != undefined && b == undefined) {
            return -1;
        } else if (a == undefined && b != undefined) {
            return 1;
        } else {
            return 0;
        }
    }

    function edit(gen: Gen) {
        dispatch("edit", gen);
    }

    function info(gen: Gen) {
        dispatch("infoShow", gen);
    }

    function deleteGen(id: number) {
        genData.deleteGen(id);
    }

    function sortBy(col: string) {
        if (sorting[0] == col) {
            if (sorting[1] == "as") {
                sorting[1] = "des";
            } else {
                sorting[1] = "as";
            }
        } else {
            sorting = [col, "as"];
        }
        resortGens();
    }

    function resortGens() {
        const sortedCoef = sorting[1] == "as" ? 1 : -1;
        if (sorting[0] == ID_NAME) {
            gens.sort((a: Gen, b: Gen) => (a.id - b.id) * sortedCoef);
        } else if (sorting[0] == MOTHER_ID_NAME) {
            gens.sort((a: Gen, b: Gen) =>
                compareWithUndefinedMore(
                    a.motherId,
                    b.motherId,
                    (a, b) => (a - b) * sortedCoef
                )
            );
        } else if (sorting[0] == FATHER_ID_NAME) {
            gens.sort((a: Gen, b: Gen) =>
                compareWithUndefinedMore(
                    a.fatherId,
                    b.fatherId,
                    (a, b) => (a - b) * sortedCoef
                )
            );
        } else {
            gens.sort((a: Gen, b: Gen) => {
                let aInfo = a.findInformation(sorting[0]);
                let bInfo = b.findInformation(sorting[0]);
                return compareWithUndefinedMore(
                    aInfo,
                    bInfo,
                    (a, b) => a.localeCompare(b) * sortedCoef
                );
            });
        }
        gens = gens;
    }
</script>

<div class="host">
    <div class="table-responsive">
        <table class="table table-striped text-nowrap">
            <thead>
                <tr>
                    <th on:click={() => sortBy(ID_NAME)}>
                        {#if sorting[0] == ID_NAME}
                            <svelte:component
                                this={sorting[1] == "as"
                                    ? CaretDownFill
                                    : CaretUpFill}
                            />
                        {/if}
                        <span>{ID_NAME}</span>
                    </th>
                    <th on:click={() => sortBy(MOTHER_ID_NAME)}>
                        {#if sorting[0] == MOTHER_ID_NAME}
                            <svelte:component
                                this={sorting[1] == "as"
                                    ? CaretDownFill
                                    : CaretUpFill}
                            />
                        {/if}
                        <span>{MOTHER_ID_NAME}</span>
                    </th>
                    <th on:click={() => sortBy(FATHER_ID_NAME)}>
                        {#if sorting[0] == FATHER_ID_NAME}
                            <svelte:component
                                this={sorting[1] == "as"
                                    ? CaretDownFill
                                    : CaretUpFill}
                            />
                        {/if}
                        <span>{FATHER_ID_NAME}</span>
                    </th>
                    {#each cols as col}
                        <th on:click={() => sortBy(col)}>
                            {#if sorting[0] == col}
                                <svelte:component
                                    this={sorting[1] == "as"
                                        ? CaretDownFill
                                        : CaretUpFill}
                                />
                            {/if}
                            <span>{col}</span>
                        </th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each gens as gen (gen.id)}
                    <tr>
                        <td class="dropdown" style:position="static">
                            <span
                                class="dropdown-toggle"
                                data-bs-toggle="dropdown">{gen.id}</span
                            >
                            <ul class="dropdown-menu">
                                <li>
                                    <button
                                        class="dropdown-item"
                                        on:click={() => edit(gen)}
                                        >Изменить</button
                                    >
                                </li>
                                <li>
                                    <button
                                        class="dropdown-item"
                                        on:click={() => info(gen)}
                                        >Просмотреть</button
                                    >
                                </li>
                                <li>
                                    <button
                                        class="dropdown-item text-danger"
                                        on:click={() => deleteGen(gen.id)}
                                        >Удалить</button
                                    >
                                </li>
                            </ul>
                        </td>
                        <td>{gen.motherId ?? ""}</td>
                        <td>{gen.fatherId ?? ""}</td>
                        {#each cols as col, j}
                            <td>{gen.findInformation(col) ?? ""}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style lang="scss">
    @import '../../util.scss';

    .host {
        user-select: none;
        -webkit-user-select: none;

        td,
        th {
            max-width: 20vw;
            overflow-x: scroll;
            @include hide-scroll();
        }

        tr :first-child {
            overflow-x: visible;
        }
    }
</style>
