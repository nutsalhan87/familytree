import { invoke } from '@tauri-apps/api'

export class Gen {
    id: number = 0;
    motherId: number | undefined;
    fatherId: number | undefined;
    information: [string, string][] = [];
    relations: [string, number[]][] = [];
    constructor() {}

    findInformation(findKey: string): string | undefined {
        const result = this.information.find(([key, value]: [string, string]) => key == findKey);
        if (result) {
            return result[1];
        } else {
            return result;
        }
    }

    findRelations(findKey: string): number[] | undefined {
        const result = this.relations.find(([key, value]: [string, number[]]) => key == findKey);
        if (result) {
            return result[1];
        } else {
            return result;
        }
    }
}

export class Template {
    name: string = "";
    properties: string[] = [];
    constructor() {}

    static findProperties(findKey: string, templates: Template[]): string[] | undefined {
        const result = templates.find((template: Template) => template.name == findKey);
        if (result) {
            return result.properties;
        } else {
            return result;
        }
    }
}

export class GenService {
    private _cols: string[] = [];
    private _gens: Gen[] = [];
    private _templates: Template[] = [];

    constructor() {
        this.updateCols();
        this.updateGens();
        this.updateTemplates();
    }

    public get cols(): string[] {
        return this._cols;
    }

    public updateCols() {
        invoke<string[]>('cols').then(
            (res) => {
                this._cols = res;
                console.log(this.cols);
            },
            (err) => {
                console.log(err);
            }
        );
    }

    public get gens(): Gen[] {
        return this._gens;
    }

    public updateGens() {
        invoke<any[]>('gens').then(
            (res) => {
                this._gens = [];
                for (let gen of res) {
                    let newGen = new Gen();
                    newGen.id = gen.id;
                    newGen.motherId = gen.motherId;
                    newGen.fatherId = gen.fatherId;
                    for (let informationColumn in gen.information) {
                        newGen.information.push([informationColumn, gen.information[informationColumn]]);
                    }
                    for (let relationsColumn in gen.relations) {
                        newGen.relations.push([relationsColumn, gen.relations[relationsColumn]]);
                    }
                    this._gens.push(newGen);
                }
                console.log(this.gens);
            },
            (err) => {
                console.log(err);
            }
        );
    }

    public saveGen(gen: Gen, oldId?: number) {
        const invokeSave = () => {
            let informationMap: Map<string, string> = new Map();
            gen.information.forEach(([key, value]: [string, string]) => informationMap.set(key, value));
            let relationsMap: Map<string, number[]> = new Map();
            gen.relations.forEach(([key, value]: [string, number[]]) => relationsMap.set(key, value));
            invoke<void>('save_gen', { gen: {
                id: gen.id,
                motherId: gen.motherId,
                fatherId: gen.fatherId,
                information: informationMap,
                relations: relationsMap
            } }).then(
                (_) => {
                    this.updateGens();
                    this.updateCols();
                },
                (err) => {
                    console.log(err);
                }
            )
        };
        if (oldId) {
            invoke<void>('delete_gen', { id: oldId }).finally(() => { invokeSave(); });
        } else {
            invokeSave();
        }
    }

    public deleteGen(id: number) {
        invoke<void>('delete_gen', { id }).then(
            (_) => {
                this.updateGens();
                this.updateCols();
            },
            (err) => { console.log(err); }
        );
    }

    public get templates(): Template[] {
        return this._templates;
    }

    public updateTemplates() {
        invoke<any>('templates').then(
            (res) => {
                this._templates = [];
                for (let name in res) {
                    this._templates.push({ name, properties: res[name] });
                }
                console.log(this.templates);
            },
            (err) => {
                console.log(err);
            }
        );
    }

    public saveTemplate(template: Template, oldName?: string) {
        const invokeSave = () => {
            invoke<void>('save_template', {
                name: template.name,
                properties: [...new Set(template.properties)]
                    .map((value: string) => value.trim())
                    .filter((value: string) => value)
            }).then(
                (_) => {
                    this.updateTemplates();
                },
                (err) => {
                    console.log(err);
                }
            );
        };
        if (oldName) {
            invoke<void>('delete_template', { name: oldName }).finally(() => { invokeSave(); });
        } else {
            invokeSave();
        }
    }

    public deleteTemplate(name: string) {
        invoke<void>('delete_template', { name }).then(
            (_) => {
                this.updateTemplates();
            },
            (err) => { console.log(err); }
        );
    }
}