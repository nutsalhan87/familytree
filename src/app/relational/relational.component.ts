import { Component } from '@angular/core';
import { GenService } from '../gen.service';

@Component({
    selector: 'relational',
    templateUrl: 'relational.component.html',
})
export class RelationalComponent {
    cols: any[] = [];
    gens: any[] = [];

    constructor(private genService: GenService) {
        setTimeout(this.updateTable.bind(this), 150);
    }
    
    updateTable() {
        this.cols = [{ name: "ID", prop: "ID" }, { name: "ID Матери", prop: "ID Матери" }, { name: "ID Отца", prop: "ID Отца" }]
            .concat(this.genService.cols.map((val) => { return { name: val, prop: val } }));
        
        let mapped: any[] = [];
        for (let gen of this.genService.gens) {
            let newRow: any = { "ID": gen.id, "ID Матери": gen.motherId, "ID Отца": gen.fatherId };
            gen.information.forEach((value: string, key: string) => { newRow[key] = value; });
            mapped.push(newRow);
        }
        this.gens = mapped;
    }
}