import { Component, EventEmitter, Input, Output } from "@angular/core";

export enum CurtainPanelContent {
    NoContent,
    TemplateManager,
    GenEditor
}

@Component({
    selector: 'curtain-panel',
    templateUrl: 'curtain-panel.component.html'
})
export class CurtainPanel {
    readonly CurtainPanelContent = CurtainPanelContent;
    @Output() closed = new EventEmitter();
    @Input() content: CurtainPanelContent = CurtainPanelContent.NoContent;

}