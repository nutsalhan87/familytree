import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Template } from "src/app/gen.service";

@Component({
    selector: 'template-editor',
    templateUrl: 'template-editor.component.html'
})
export class TemplateEditorComponent implements OnInit {
    @Input() oldName: string | undefined;
    @Input() template: Template = { name: "", properties: [] };
    @Output() cancelled: EventEmitter<void> = new EventEmitter(); 
    @Output() saved: EventEmitter<{ template: Template, oldName: string | undefined }> = new EventEmitter();
    isNameValid: boolean = false;
    constructor() {}

    ngOnInit(): void {
        this.isNameValid = this.oldName ? true : false;
    }

    addProperty() {
        this.template.properties.push("");
    }

    removeProperty(index: number) {
        this.template.properties.splice(index, 1);
    }

    cancel() {
        this.cancelled.emit();
    }

    save() {
        if (this.isNameValid) {
            this.saved.emit({ template: this.template, oldName: this.oldName });
        }
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    validateName(name: string) {
        this.isNameValid = name.trim() ? true : false;
    }
}