<script lang="ts">
    import { fade } from "svelte/transition";
    import { ButtonClassPrimary, ButtonClassSuccess } from "./lib/util/button-class";
    import type { Gen } from "./lib/store/gen";
    import Logo from "./lib/components/svg/Logo.svelte";
    import Relational from "./lib/components/Relational.svelte";
    import CurtainPanel, {
        CurtainPanelContent,
    } from "./lib/components/CurtainPanel.svelte";
    import Graph from "./lib/components/Graph.svelte";
    import { onMount } from "svelte";
    import { sineOut } from "svelte/easing";

    let genEditorButtonClass = new ButtonClassSuccess(false);
    let templateManagerButtonClass = new ButtonClassSuccess(false);
    let relationalButtonClass = new ButtonClassPrimary(true);
    let graphButtonClass = new ButtonClassPrimary(false);

    let curtainPanelContent = CurtainPanelContent.NoContent;
    
    let gen: Gen | undefined;

    let navbarHeight;
    $: navbarHeightPx = navbarHeight?.toString().concat("px") ?? '';

    let show = false;
    onMount(() => show = true);

    function closeCurtain() {
        curtainPanelContent = CurtainPanelContent.NoContent;
        templateManagerButtonClass.isActive = false;
        templateManagerButtonClass = templateManagerButtonClass;
        genEditorButtonClass.isActive = false;
        genEditorButtonClass = genEditorButtonClass;
    }

    function showTemplateManager() {
        templateManagerButtonClass.switchClass();
        if (templateManagerButtonClass.isActive) {
            genEditorButtonClass.isActive = false;
            genEditorButtonClass = genEditorButtonClass;
            curtainPanelContent = CurtainPanelContent.TemplateManager;
        } else {
            curtainPanelContent = CurtainPanelContent.NoContent;
        }
        templateManagerButtonClass = templateManagerButtonClass;
    }

    function showGenEditor(editGen?: Gen) {
        gen = editGen;
        genEditorButtonClass.switchClass();
        if (genEditorButtonClass.isActive) {
            templateManagerButtonClass.isActive = false;
            templateManagerButtonClass = templateManagerButtonClass;
            curtainPanelContent = CurtainPanelContent.GenEditor;
        } else {
            curtainPanelContent = CurtainPanelContent.NoContent;
        }
        genEditorButtonClass = genEditorButtonClass;
    }

    function showGenInfo(showGen: Gen) {
        gen = showGen;
        curtainPanelContent = CurtainPanelContent.GenInfo;
    }

    function navigateRelational() {
        relationalButtonClass.isActive = true;
        relationalButtonClass = relationalButtonClass;
        graphButtonClass.isActive = false;
        graphButtonClass = graphButtonClass;
    }

    function navigateGraph() {
        relationalButtonClass.isActive = false;
        relationalButtonClass = relationalButtonClass;
        graphButtonClass.isActive = true;
        graphButtonClass = graphButtonClass;
    }
</script>

<div class="host">
    <nav bind:offsetHeight={navbarHeight} class="navbar navbar-expand sticky-top shadow bg-body">
        <div class="container-fluid">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="navbar-brand">
                <Logo sideSize={2}/>
                {#if show}
                    <span transition:fade={{delay: 150, duration: 900, easing: sineOut}}>
                        FamilyTree
                    </span>
                {/if}
            </a>
            <div class="navbar-nav mx-3 column-gap-2">
                <div class="nav-item">
                    <button class="btn text-nowrap {relationalButtonClass.btnClass}"
                        on:click={navigateRelational}>Таблица</button>
                </div>
                <div class="nav-item">
                    <button class="btn text-nowrap {graphButtonClass.btnClass}"
                        on:click={navigateGraph}>Граф</button>
                </div>
                <div class="nav-item">
                    <button class="btn text-nowrap {templateManagerButtonClass.btnClass}"
                        on:click={showTemplateManager}>Шаблоны</button>
                </div>
                <div class="nav-item">
                    <button class="btn text-nowrap {genEditorButtonClass.btnClass}"
                        on:click={() => showGenEditor()}>Добавить человека</button>
                </div>
            </div>
        </div>
    </nav>
    <div>
        <div hidden={!relationalButtonClass.isActive}>
            <Relational on:edit={(v) => showGenEditor(v.detail)} on:infoShow={(v) => showGenInfo(v.detail)}/>
        </div>
        <div hidden={!graphButtonClass.isActive}>
            <Graph/>
        </div>
    </div>
    {#if curtainPanelContent != CurtainPanelContent.NoContent}
        <CurtainPanel on:close={closeCurtain} content={curtainPanelContent} {gen} --t={navbarHeightPx}/>
    {/if}
</div>

<style lang="scss">
    @import './util.scss';

    .host {
        .navbar-nav {
            overflow-x: scroll;
            @include hide-scroll();
        }
    }
</style>
