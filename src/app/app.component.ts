import { Component } from '@angular/core';
import { ButtonClassPrimary, ButtonClassSuccess } from './util/button-class';
import { CurtainPanelContent } from './curtain-panel/curtain-panel.component';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    readonly CurtainPanelContent = CurtainPanelContent;
    genEditorButtonClass = new ButtonClassSuccess(false);
    templateManagerButtonClass = new ButtonClassSuccess(false);
    relationalButtonClass = new ButtonClassPrimary(true);
    graphButtonClass = new ButtonClassPrimary(false);
    curtainPanelContent = CurtainPanelContent.NoContent;

    constructor() {}

    closeCurtain() {
        this.curtainPanelContent = CurtainPanelContent.NoContent;
        this.templateManagerButtonClass.isActive = false;
        this.genEditorButtonClass.isActive = false;
    }

    switchTemplateManager() {
        this.templateManagerButtonClass.switchClass();
        if (this.templateManagerButtonClass.isActive) {
            this.genEditorButtonClass.isActive = false;
            this.curtainPanelContent = CurtainPanelContent.TemplateManager;
        } else {
            this.curtainPanelContent = CurtainPanelContent.NoContent;
        }
    }

    switchGenEditor() {
        this.genEditorButtonClass.switchClass();
        if (this.genEditorButtonClass.isActive) {
            this.templateManagerButtonClass.isActive = false;
            this.curtainPanelContent = CurtainPanelContent.GenEditor;
        } else {
            this.curtainPanelContent = CurtainPanelContent.NoContent;
        }
    }

    navigateRelational() {
        this.relationalButtonClass.switchClass();
        this.graphButtonClass.switchClass();
    }

    navigateGraph() {
        this.relationalButtonClass.switchClass();
        this.graphButtonClass.switchClass();
    }
}