import { Component, EventEmitter, Input, Output } from "@angular/core";

export enum CurtainPanelContent {
    NoContent,
    TemplateManager,
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
    @Output() closed = new EventEmitter();
    @Input() content: CurtainPanelContent = CurtainPanelContent.NoContent;
    @Input() genId: number | undefined;
    constructor() {}

    close() {
        this.closed.emit();
    }
}