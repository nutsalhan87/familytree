import { Component, Input } from "@angular/core";

@Component({
    selector: 'logo-svg',
    templateUrl: 'logo-svg.component.svg',
    styleUrls: ['logo-svg.component.scss']
})
export class LogoSvgComponent {
    @Input({ required: true, transform: (v: number) => `${v}em` }) sideSize!: string;
    constructor() { }
}