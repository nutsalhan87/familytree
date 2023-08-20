import { Component, Input, OnInit } from "@angular/core";
import { Gen, GenService } from "src/app/gen.service";

@Component({
    selector: 'gen-info',
    templateUrl: 'gen-info.component.html'
})
export class GenInfoComponent implements OnInit {
    @Input() id: number | undefined;
    gen: Gen = new Gen();
    constructor(private genService: GenService) {}

    ngOnInit(): void {
        const result = this.genService.gens.find((value: Gen) => value.id == this.id);
        if (result) {
            this.gen = result;
        }
    }
}