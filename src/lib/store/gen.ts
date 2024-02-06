import { writable } from "svelte/store";
import { invoke } from '@tauri-apps/api';
import { event } from '@tauri-apps/api';

export class Gen {
    id: number = 0;
    motherId: number | undefined;
    fatherId: number | undefined;
    information: [string, string][] = [];
    relations: [string, number[]][] = [];
    constructor() { }

    findInformation(findKey: string): string | undefined {
        const result = this.information.find(([key, _]: [string, string]) => key == findKey);
        if (result) {
            return result[1];
        } else {
            return undefined;
        }
    }

    findRelations(findKey: string): number[] | undefined {
        const result = this.relations.find(([key, _]: [string, number[]]) => key == findKey);
        if (result) {
            return result[1];
        } else {
            return undefined;
        }
    }
}

export class Template {
    name: string = "";
    properties: string[] = [];
    constructor() { }

    static findProperties(key: string, templates: Template[]): string[] | undefined {
        const result = templates.find((template: Template) => template.name == key);
        if (result) {
            return result.properties;
        } else {
            return undefined;
        }
    }
}

interface RawGenData {
    gens: any[];
    templates: any[];
}

export interface GenData {
    gens: Gen[];
    templates: Template[];
}

function createGenDataStore() {
    const { subscribe, set } = writable<GenData>({
        gens: [],
        templates: []
    });

    event.listen<RawGenData>('gendata-updated', (rawGenData) => { updateService(rawGenData.payload); });
    invoke<RawGenData>('gen_data').then(
        (rawGenData) => updateService(rawGenData),
        (err) => console.log(err)
    );

    function rawToGens(res: any[]): Gen[] {
        let gens: Gen[] = [];
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
            gens.push(newGen);
        }

        console.log(gens);
        return gens;
    }

    function saveGen(gen: Gen, oldId?: number) {
        let informationMap: Map<string, string> = new Map();
        gen.information.forEach(([key, value]: [string, string]) => informationMap.set(key, value));
        let relationsMap: Map<string, number[]> = new Map();
        gen.relations.forEach(([key, value]: [string, number[]]) => relationsMap.set(key, value));

        invoke('save_gen', {
            gen: {
                id: gen.id,
                motherId: gen.motherId,
                fatherId: gen.fatherId,
                information: informationMap,
                relations: relationsMap
            },
            oldId
        }).catch((err) => { console.log(err); });
    }

    function deleteGen(id: number) {
        invoke('delete_gen', { id }).catch((err) => { console.log(err); });
    }

    function rawToTemplates(res: any) {
        let templates: Template[] = [];
        for (let name in res) {
            templates.push({ name, properties: res[name] });
        }

        console.log(templates);
        return templates;
    }

    function saveTemplate(template: Template, oldName?: string) {
        invoke<void>('save_template', {
            name: template.name,
            properties: [...new Set(template.properties)]
                .map((value: string) => value.trim())
                .filter((value: string) => value),
            oldName
        }).catch((err) => { console.log(err); });
    }

    function deleteTemplate(name: string) {
        invoke('delete_template', { name }).catch((err) => { console.log(err); });
    }

    function updateService(rawGenData: RawGenData) {
        let gens = rawToGens(rawGenData.gens);
        let templates = rawToTemplates(rawGenData.templates);
        let genData: GenData = { gens, templates };
        set(genData);
    }

    return {
        subscribe,
        saveGen,
        deleteGen,
        saveTemplate,
        deleteTemplate
    };
}

export const genData = createGenDataStore();