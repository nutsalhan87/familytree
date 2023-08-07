import { invoke } from '@tauri-apps/api'

export interface Gen {
    id: number,
    motherId: number,
    fatherId: number,
    information: Map<string, string>,
    relations: Map<string, number[]>
}

export interface Template {
    name: string,
    properties: string[]
}

export class GenService {
    private _cols: string[] = [];
    private _gens: Gen[] = [];
    private _templates: Map<string, string[]> = new Map();

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
                    let newGen: Gen = {
                        id: gen.id,
                        motherId: gen.motherId,
                        fatherId: gen.fatherId,
                        information: new Map(),
                        relations: new Map()
                    };
                    for (let informationColumn in gen.information) {
                        newGen.information.set(informationColumn, gen.information[informationColumn]);
                    }
                    for (let relationsColumn in gen.relations) {
                        newGen.relations.set(relationsColumn, gen.relations[relationsColumn]);
                    }
                    this._gens.push(newGen);
                }
            },
            (err) => {
                console.log(err);
            }
        );
    }

    public get templates(): Map<string, string[]> {
        return this._templates;
    }

    public updateTemplates() {
        invoke<any>('templates').then(
            (res) => {
                this._templates = new Map();
                for (let name in res) {
                    this._templates.set(name, res[name]);
                }
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