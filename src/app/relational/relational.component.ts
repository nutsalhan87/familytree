import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Gen, GenService } from '../gen.service';
import { IconNamesEnum } from 'ngx-bootstrap-icons';
import { Subscription } from 'rxjs';

export const ID_NAME = "ID";
export const MOTHER_ID_NAME = "ID Матери";
export const FATHER_ID_NAME = "ID Отца";

@Component({
    selector: 'relational',
    templateUrl: 'relational.component.html',
    styleUrls: ['relational.component.scss']
})
export class RelationalComponent implements OnDestroy {
    readonly ID_NAME = ID_NAME;
    readonly MOTHER_ID_NAME = MOTHER_ID_NAME;
    readonly FATHER_ID_NAME = FATHER_ID_NAME;
    readonly IconNamesEnum = IconNamesEnum;
    sorting: [string, "as" | "des"] = [this.ID_NAME, "as"];
    cols: string[] = [];
    gens: Gen[] = [];
    subscription: Subscription;
    @Output() edited = new EventEmitter<number>();
    @Output() infoShowed = new EventEmitter<number>();
    constructor(private genService: GenService, private changeDetectorRef: ChangeDetectorRef) {
        setInterval(() => { this.changeDetectorRef.detectChanges(); }, 100); // sorry...
        this.subscription = this.genService.genData.subscribe((genData) => { this.updateData(genData.gens); });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    updateData(gens: Gen[]) {
        this.gens = [...gens];
        this.resortGens();
        this.cols = [];
        for (let gen of this.gens) {
            this.cols.push(...gen.information.map(([col, _]) => col));
        }
        this.cols = [...new Set(this.cols)];
        this.cols.sort();
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
        this.resortGens();
    }

    resortGens() {
        const sortedCoef = this.sorting[1] == "as" ? 1 : -1; 
        if (this.sorting[0] == this.ID_NAME) {
            this.gens.sort((a: Gen, b: Gen) => (a.id - b.id) * sortedCoef);
        } else if (this.sorting[0] == this.MOTHER_ID_NAME) {
            this.gens.sort((a: Gen, b: Gen) => 
                this.compareWithUndefinedMore(a.motherId, b.motherId, (a, b) => (a - b) * sortedCoef)
            );
        } else if (this.sorting[0] == this.FATHER_ID_NAME) {
            this.gens.sort((a: Gen, b: Gen) => 
                this.compareWithUndefinedMore(a.fatherId, b.fatherId, (a, b) => (a - b) * sortedCoef)
            );
        } else {
            this.gens.sort((a: Gen, b: Gen) => {
                let aInfo = a.findInformation(this.sorting[0]);
                let bInfo = b.findInformation(this.sorting[0]);
                return this.compareWithUndefinedMore(aInfo, bInfo, (a, b) => a.localeCompare(b) * sortedCoef);
            })
        }
    }
}