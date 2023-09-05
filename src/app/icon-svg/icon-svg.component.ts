import { Component, Input } from "@angular/core";

@Component({
    selector: 'icon-svg',
    templateUrl: 'icon-svg.component.svg',
    styleUrls: ['icon-svg.component.scss']
})
export class IconSvgComponent {
    @Input() sideSize: string = '';
    constructor() {}
}