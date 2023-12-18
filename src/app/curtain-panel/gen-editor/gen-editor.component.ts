import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { Gen, GenService, Template } from "src/app/gen.service";
import { NgxFloatUiPlacements } from "ngx-float-ui";
import { FATHER_ID_NAME, ID_NAME, MOTHER_ID_NAME } from "src/app/relational/relational.component";
import { Subscription } from "rxjs";

interface GenForEditor {
    id: string,
    motherId: string,
    fatherId: string,
    information: [string, string][],
    relations: [string, string][]
}

interface IsValid {
    id: boolean;
    motherId: boolean;
    fatherId: boolean;
}

@Component({
    selector: 'gen-editor',
    templateUrl: 'gen-editor.component.html',
    styleUrls: ['gen-editor.component.scss']
})
export class GenEditorComponent implements OnInit, OnDestroy {
    readonly NgxFloatUiPlacements = NgxFloatUiPlacements;
    readonly idInfo: string = `ID - это уникальный идентификатора человека. Его можно указать в предустановленных связях (ID матери и отца), а также в каких-нибудь своих ("Связи").<br>
    Рекомендуется начать отчёт с 1 и для каждой новой ветви добавлять единицу (1, 2, 3 и т.д.).`;
    readonly idMotherInfo: string = `ID Матери - это ID женщины, являющейся матерью для этого человека.<br>
    Например, если вы создаете человека с ID 3 и матерью для него является женщина с ID 1, следует написать здесь 1.`;
    readonly idFatherInfo: string = `ID Отца - это ID мужчины, являющегося отцом для этого человека.<br>
    Например, если вы создаете человека с ID 3 и отцом для него является мужчина с ID 2, следует написать здесь 2.`;
    readonly informationInfo: string = `Дополнительная информация о человеке в любом формате. Например это может быть "Профессия", "Дата рождения" или даже "Номер телефона".<br>
    Она также появится в таблице в виде столбцов`;
    readonly relationsInfo: string = `Связи человека с другими людьми.<br>
    Например, можно создать связь "Брат", а в качестве значения перечислить ID'ы тех людей, кто является братом создаваемому человеку.<br>
    Необязательно указывать родственные связи - они могут быть любыми, например, "Наследник" или "С кем плохие отношения".`;
    gen: GenForEditor = { id: '', motherId: '', fatherId: '', information: [], relations: [] };
    isValid: IsValid = {
        id: true,
        motherId: true,
        fatherId: true
    }
    templateNames: string[] = [];
    subscription: Subscription;
    @Input() id: number | undefined;
    @Output() cancelled = new EventEmitter<void>();
    constructor(private genService: GenService) {
        this.subscription = this.genService.genData.subscribe((genData) => { this.updateTemplateNames(genData.templates); });
    }

    ngOnInit(): void {
        if (this.id) {
            const editGen = this.genService.genData.getValue().gens.find((value: Gen) => value.id == this.id);
            if (editGen) {
                this.gen.id = editGen.id.toString();
                this.gen.fatherId = editGen.fatherId ? editGen.fatherId.toString() : '';
                this.gen.motherId = editGen.motherId ? editGen.motherId.toString() : '';
                this.gen.information = editGen.information.map<[string, string]>(([key, value]: [string, string]) => [key.slice(), value.slice()]);
                this.gen.relations = editGen.relations.map<[string, string]>(([key, value]: [string, number[]]) => [key.slice(), value.join(', ')]);
            }
        }

        this.validateId(this.gen.id);
        this.validateMotherId(this.gen.motherId);
        this.validateFatherId(this.gen.fatherId);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private updateTemplateNames(templates: Template[]) {
        this.templateNames = [...templates.map((value) => value.name)];
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    validateId(id: string) {
        if (!this.isInt(id) || Number.parseInt(id) == 0) {
            this.isValid.id = false;
        } else {
            this.isValid.id = true;
        }
    }

    validateMotherId(id: string) {
        if (id != '' && (!this.isInt(id) || parseInt(id) == parseInt(this.gen.fatherId) || parseInt(id) == parseInt(this.gen.id))) {
            this.isValid.motherId = false;
        } else {
            this.isValid.motherId = true;
        }
    }

    validateFatherId(id: string) {
        if (id != '' && (!this.isInt(id) || parseInt(id) == parseInt(this.gen.motherId) || parseInt(id) == parseInt(this.gen.id))) {
            this.isValid.fatherId = false;
        } else {
            this.isValid.fatherId = true;
        }
    }

    addInformation() {
        this.gen.information.push(["", ""]);
    }

    selectTemplate(name?: string) {
        if (!name) {
            this.gen.information = [];
        } else {
            const template = Template
                .findProperties(name, this.genService.genData.getValue().templates)
                ?.map<[string, string]>((value: string) => [value, ""]);
            this.gen.information = template ? template : [];
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
            genTransformed.information = this.gen.information.filter(([k, _]) => {
                return ![ID_NAME, MOTHER_ID_NAME, FATHER_ID_NAME].includes(k);
            });
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
        return this.isValid.id
            && this.isValid.motherId
            && this.isValid.fatherId
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