import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TemplateEditData } from "./template-editor/template-editor.component";

export enum CurtainPanelContent {
    NoContent,
    TemplateManager,
    TemplateEditor,
    GenEditor,
    GenInfo
}

@Component({
    selector: 'curtain-panel',
    templateUrl: 'curtain-panel.component.html',
    styleUrls: ['curtain-panel.component.scss']
})
export class CurtainPanelComponent {
    readonly CurtainPanelContent = CurtainPanelContent;
    templateEditData: TemplateEditData = { template: { name: "", properties: [] }, oldName: undefined };
    @Output() closed = new EventEmitter();
    @Input() content: CurtainPanelContent = CurtainPanelContent.NoContent;
    @Input() genId: number | undefined;
    constructor() { }

    editTemplate(templateEditData: TemplateEditData) {
        this.templateEditData = templateEditData;
        this.content = CurtainPanelContent.TemplateEditor;
    }

    openTemplateManager() {
        this.content = CurtainPanelContent.TemplateManager;
    }

    close() {
        this.closed.emit();
    }
}