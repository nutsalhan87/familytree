import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Gen, GenService, Template } from "src/app/gen.service";

interface GenForEditor {
    id: string,
    motherId: string,
    fatherId: string,
    information: [string, string][],
    relations: [string, string][]
}

@Component({
    selector: 'gen-editor',
    templateUrl: 'gen-editor.component.html'
})
export class GenEditorComponent implements OnInit {
    @Input() id: number | undefined;
    gen: GenForEditor = { id: '', motherId: '', fatherId: '', information: [], relations: [] };
    isIdValid: boolean = true;
    isMotherIdValid: boolean = true;
    isFatherIdValid: boolean = true;
    @Output() cancelled = new EventEmitter<void>();
    constructor(private genService: GenService) {}

    get templateNames(): string[] {
        return [...this.genService.templates.map((value: Template) => value.name)];
    }

    ngOnInit(): void {
        if (this.id) {
            const editGen = this.genService.gens.find((value: Gen) => value.id == this.id);
            if (editGen) {
                this.gen.id = editGen.id.toString();
                if (editGen.fatherId) {
                    this.gen.fatherId = editGen.fatherId.toString();
                } else {
                    this.gen.fatherId = '';
                }
                if (editGen.motherId) {
                    this.gen.motherId = editGen.motherId.toString();
                } else {
                    this.gen.motherId = '';
                }
                this.gen.information = editGen.information.map<[string, string]>(([key, value]: [string, string]) => [key.slice(), value.slice()]);
                this.gen.relations = editGen.relations.map<[string, string]>(([key, value]: [string, number[]]) => [key, value.join(', ')]);
            }
        }

        this.validateId(this.gen.id);
        this.validateMotherId(this.gen.motherId);
        this.validateFatherId(this.gen.fatherId);
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    validateId(id: string) {
        if (!this.isInt(id) || Number.parseInt(id) == 0) {
            this.isIdValid = false;
        } else {
            this.isIdValid = true;
        }
    }

    validateMotherId(id: string) {
        if (id != '' && (!this.isInt(id) || id == this.gen.fatherId || id == this.gen.id)) {
            this.isMotherIdValid = false;
        } else {
            this.isMotherIdValid = true;
        }
    }

    validateFatherId(id: string) {
        if (id != '' && (!this.isInt(id) || id == this.gen.motherId || id == this.gen.id)) {
            this.isFatherIdValid = false;
        } else {
            this.isFatherIdValid = true;
        }
    }

    addInformation() {
        this.gen.information.push(["", ""]);
    }

    selectTemplate(name?: string) {
        if (!name) {
            this.gen.information = [];
        } else {
            const template = Template.findProperties(name, this.genService.templates)?.map<[string, string]>((value: string) => [value, ""]);
            if (template) {
                this.gen.information = template;
            } else {
                this.gen.information = [];
            }
        }
    }

    removeInformationProperty(index: number) {
        this.gen.information.splice(index, 1);
    }

    addRelation() {
        this.gen.relations.push(["", ""]);
    }

    isRelationsValid(index: number): boolean {
        const line = this.gen.relations[index][1];
        if (this.parseIntArray(line)) {
            return true;
        } else {
            return false;
        }
    }

    removeRelation(index: number) {
        this.gen.relations.splice(index, 1);
    }

    cancel() {
        this.cancelled.emit();
    }

    save() {
        if (this.isAllValid()) {
            let genTransformed = new Gen();
            genTransformed.id = Number.parseInt(this.gen.id);
            genTransformed.motherId = Number.parseInt(this.gen.motherId);
            genTransformed.fatherId = Number.parseInt(this.gen.fatherId);
            genTransformed.information = this.gen.information;
            this.gen.relations.forEach((value: [string, string]) => {
                const array = this.parseIntArray(value[1]);
                if (array) {
                    genTransformed.relations.push([value[0], array]);
                }
            });
            this.genService.saveGen(genTransformed, this.id);
            this.cancelled.emit();
        }
    }

    isAllValid(): boolean {
        return this.isIdValid
            && this.isMotherIdValid
            && this.isFatherIdValid
            && this.gen.relations.every((_, index: number) => this.isRelationsValid(index));
    }

    parseIntArray(line: string): number[] | undefined {
        const strNumbers: string[] = line.split(',').map((value: string) => value.trim());
        if (strNumbers.some((value: string) => !this.isInt(value))) {
            return undefined;
        } else {
            return strNumbers.map((value: string) => parseInt(value));
        }
    }

    isInt(value: string | number): boolean {
        if (typeof value == "number") {
            value = value.toString();
        }
        return value.match('^\\d+$') != null;
    }
}