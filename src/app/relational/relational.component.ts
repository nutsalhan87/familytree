import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Gen, GenService } from '../gen.service';
import { listen } from '@tauri-apps/api/event';

@Component({
    selector: 'relational',
    templateUrl: 'relational.component.html',
    styleUrls: ['relational.component.scss']
})
export class RelationalComponent {
    readonly ID_NAME = "ID";
    readonly MOTHER_ID_NAME = "ID Матери";
    readonly FATHER_ID_NAME = "ID Отца";
    sorting: [string, "as" | "des"] = [this.ID_NAME, "as"];
    @Output() edited = new EventEmitter<number>();
    @Output() infoShowed = new EventEmitter<number>();
    constructor(private genService: GenService, private changeDetectorRef: ChangeDetectorRef) {
        setInterval(() => { changeDetectorRef.detectChanges(); }, 100);
        listen('service-updated', () => {
            changeDetectorRef.detectChanges();
        });
    }

    get cols(): string[] {
        return this.genService.cols;
    }

    get gens(): Gen[] {
        const sortedCoef = this.sorting[1] == "as" ? 1 : -1; 
        let gensSorted: Gen[] = [...this.genService.gens];
        if (this.sorting[0] == this.ID_NAME) {
            gensSorted.sort((a: Gen, b: Gen) => (a.id - b.id) * sortedCoef);
        } else if (this.sorting[0] == this.MOTHER_ID_NAME) {
            gensSorted.sort((a: Gen, b: Gen) => 
                this.compareWithUndefinedMore(a.motherId, b.motherId, (a, b) => (a - b) * sortedCoef)
            );
        } else if (this.sorting[0] == this.FATHER_ID_NAME) {
            gensSorted.sort((a: Gen, b: Gen) => 
                this.compareWithUndefinedMore(a.fatherId, b.fatherId, (a, b) => (a - b) * sortedCoef)
            );
        } else {
            gensSorted.sort((a: Gen, b: Gen) => {
                let aInfo = a.findInformation(this.sorting[0]);
                let bInfo = b.findInformation(this.sorting[0]);
                return this.compareWithUndefinedMore(aInfo, bInfo, (a, b) => a.localeCompare(b) * sortedCoef);
            })
        }

        return gensSorted;
    }

    compareWithUndefinedMore(a: any, b: any, f: (a: any, b: any) => number ) {
        if (a != undefined && b != undefined) {
            return f(a, b);
        } else if (a != undefined && b == undefined) {
            return -1;
        } else if (a == undefined && b != undefined) {
            return 1;
        } else {
            return 0;
        }
    }

    edit(id: number) {
        this.edited.emit(id);
    }

    info(id: number) {
        this.infoShowed.emit(id);
    }
    
    delete(id: number) {
        this.genService.deleteGen(id);
    }

    sortBy(col: string) {
        if (this.sorting[0] == col) {
            if (this.sorting[1] == "as") {
                this.sorting[1] = "des";
            } else {
                this.sorting[1] = "as";
            }
        } else {
            this.sorting = [col, "as"];
        }
    }
}