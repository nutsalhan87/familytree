import { Component } from "@angular/core";
import { GenService, Template } from "src/app/gen.service";

@Component({
    selector: 'template-manager',
    templateUrl: 'template-manager.component.html'
})
export class TemplateManagerComponent {
    isTemplates: boolean = true;
    isEditor: boolean = false;
    template: { name: string, properties: string[] } = { name: "", properties: [] };
    oldName: string | undefined;
    constructor(private genService: GenService) {}

    edit(name?: string | undefined) {
        this.isTemplates = false;
        this.isEditor = true;
        if (name) {
            this.oldName = name;
            const properties = this.genService.templates.get(name);
            if (!properties) {
                this.template = { name: "", properties: [] };
                return;
            }
            this.template = { name, properties: Array.from(properties) };
        } else {
            this.oldName = undefined;
            this.template = { name: "", properties: [] };
        }
    }

    cancelEdit() {
        this.isTemplates = true;
        this.isEditor = false;
    }

    saveEdit(editedTemplate: { template: Template, oldName: string | undefined }) {
        this.genService.saveTemplate(editedTemplate.template, editedTemplate.oldName);
        this.cancelEdit();
    }
}