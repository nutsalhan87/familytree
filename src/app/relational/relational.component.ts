import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Gen, GenService } from '../gen.service';
import { listen } from '@tauri-apps/api/event';

@Component({
    selector: 'relational',
    templateUrl: 'relational.component.html',
})
export class RelationalComponent {
    @Output() edited = new EventEmitter<number>();
    @Output() infoShowed = new EventEmitter<number>();
    constructor(private genService: GenService, private changeDetectorRef: ChangeDetectorRef) {
        setInterval(() => { changeDetectorRef.detectChanges(); }, 100);
        listen('service-updated', () => {
            changeDetectorRef.detectChanges();
        });
    }

    get cols() {
        return this.genService.cols;
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