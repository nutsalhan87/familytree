import { Component, EventEmitter, Output } from '@angular/core';
import { Gen, GenService } from '../gen.service';
import { } from '@floating-ui/dom';

@Component({
    selector: 'relational',
    templateUrl: 'relational.component.html',
})
export class RelationalComponent {
    @Output() edited = new EventEmitter<number>();
    @Output() infoShowed = new EventEmitter<number>();
    constructor(private genService: GenService) { }

    get cols() {
        return this.genService.cols.sort();
    }

    get gens() {
        return this.genService.gens.sort((a: Gen, b: Gen) => a.id - b.id);
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
}