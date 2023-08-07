import { Component, EventEmitter, Output } from "@angular/core";
import { GenService } from "src/app/gen.service";

@Component({
    selector: 'templates',
    templateUrl: 'templates.component.html'
})
export class TemplatesComponent {
    @Output() edited: EventEmitter<string> = new EventEmitter<string>();
    constructor(private genService: GenService) { }

    get templates(): [string, string[]][] {
        return Array.from(this.genService.templates.entries());
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