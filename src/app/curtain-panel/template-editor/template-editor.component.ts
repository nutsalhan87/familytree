import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GenService, Template } from "src/app/gen.service";
import { NgxFloatUiPlacements } from "ngx-float-ui";

export interface TemplateEditData {
    template: Template;
    oldName: string | undefined;
}

@Component({
    selector: 'template-editor',
    templateUrl: 'template-editor.component.html',
    styleUrls: ['template-editor.component.scss']
})
export class TemplateEditorComponent implements OnInit {
    readonly NgxFloatUiPlacements = NgxFloatUiPlacements;
    readonly templateNameInfo: string = `Например, 'ФИО' или 'Историческая личность'.`;
    readonly propertiesInfo: string = `Например, 'Работа', 'Имя', 'Прозвище' и т.д.`;
    isNameValid: boolean = false;
    @Input() templateEditData: TemplateEditData = {
        template: { name: "", properties: [] },
        oldName: undefined
    };
    @Output() returned: EventEmitter<void> = new EventEmitter(); 
    constructor(private genService: GenService) {}

    ngOnInit(): void {
        this.isNameValid = this.templateEditData.oldName ? true : false;
    }

    addProperty() {
        this.templateEditData.template.properties.push("");
    }

    removeProperty(index: number) {
        this.templateEditData.template.properties.splice(index, 1);
    }

    close() {
        this.returned.emit();
    }

    save() {
        if (this.isNameValid) {
            this.genService.saveTemplate(this.templateEditData.template, this.templateEditData.oldName);
            this.returned.emit();
        }
    }

    trackByIndex(index: number, _: any): any {
        return index;
    }

    validateName(name: string) {
        this.isNameValid = name.trim() ? true : false;
    }
}