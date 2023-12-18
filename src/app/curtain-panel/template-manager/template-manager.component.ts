import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import { GenService, Template } from "src/app/gen.service";
import { TemplateEditData } from "../template-editor/template-editor.component";
import { NgxFloatUiPlacements } from "ngx-float-ui";
import { Subscription } from "rxjs";

@Component({
    selector: 'template-manager',
    templateUrl: 'template-manager.component.html',
    styleUrls: ['template-manager.component.scss']
})
export class TemplateManagerComponent implements OnDestroy {
    readonly NgxFloatUiPlacements = NgxFloatUiPlacements;
    readonly templateInfo: string = `Шаблоны позволяют не тратить время на ручной набор названий столбцов, которые вы хотите добавить в информацию о человеке.<br>
    Например, можно создать шаблон ФИО, который при добавлении создаст столбцы "Фамилия", "Имя" и "Отчество" - вводить вручную их больше не придется.`;
    templates: Template[] = [];
    subscription: Subscription;
    @Output() edited: EventEmitter<TemplateEditData> = new EventEmitter();
    @Output() closed: EventEmitter<void> = new EventEmitter();
    constructor(private genService: GenService) {
        this.subscription = this.genService.genData.subscribe((genData) => { this.templates = [...genData.templates]; });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    newTemplate() {
        this.edited.emit({ template: { name: "", properties: [] }, oldName: undefined });
    }

    edit(name: string) {
        let editData: TemplateEditData = {
            template: {
                name,
                properties: []
            },
            oldName: name
        };
        const properties = Template.findProperties(name, this.templates);
        if (properties) {
            editData.template.properties = [...properties];
        }
        this.edited.emit(editData);
    }

    delete(name: string) {
        this.genService.deleteTemplate(name);
    }

    close() {
        this.closed.emit();
    }
}