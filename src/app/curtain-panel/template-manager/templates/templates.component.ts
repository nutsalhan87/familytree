import { Component, EventEmitter, Output } from "@angular/core";
import { GenService, Template } from "src/app/gen.service";

@Component({
    selector: 'templates',
    templateUrl: 'templates.component.html',
    styleUrls: ['templates.component.scss']
})
export class TemplatesComponent {
    @Output() edited: EventEmitter<string> = new EventEmitter<string>();
    constructor(private genService: GenService) { }

    get templates(): Template[] {
        return this.genService.templates;
    }

    newTemplate() {
        this.edited.emit();
    }

    edit(name: string) {
        this.edited.emit(name);
    }

    delete(name: string) {
        this.genService.deleteTemplate(name);
    }
}