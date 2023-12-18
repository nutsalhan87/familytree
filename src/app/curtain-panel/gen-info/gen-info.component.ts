import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Gen, GenService } from "src/app/gen.service";

@Component({
    selector: 'gen-info',
    templateUrl: 'gen-info.component.html',
    styleUrls: ['gen-info.component.scss']
})
export class GenInfoComponent implements OnInit {
    @Input() id: number | undefined;
    gen: Gen = new Gen();
    @Output() closed = new EventEmitter<void>();
    constructor(private genService: GenService) {}

    ngOnInit(): void {
        const result = this.genService.genData.getValue().gens.find((value: Gen) => value.id == this.id);
        if (result) {
            this.gen = result;
        }
    }

    close() {
        this.closed.emit();
    }
}