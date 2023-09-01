import { Component, Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';


@Directive({
    selector: '[mouseDraggable]'
})
export class MouseDraggableDirective {
    @Input() xCoordinate: number = 0;
    @Output() xCoordinateChange = new EventEmitter<number>();
    @Input() yCoordinate: number = 0;
    @Output() yCoordinateChange = new EventEmitter<number>();
    startX: number = 0;
    startY: number = 0;
    isDragging = false;
    constructor() {}

    @HostListener('click', ['$event']) onMouseClick(event: MouseEvent) {
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.isDragging = !this.isDragging;
    }

    @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            const currentMoveX = event.clientX - this.startX;
            const currentMoveY = event.clientY - this.startY;
            this.startX += currentMoveX;
            this.startY += currentMoveY;
            this.xCoordinate += currentMoveX;
            this.yCoordinate += currentMoveY;
            this.xCoordinateChange.emit(this.xCoordinate);
            this.yCoordinateChange.emit(this.yCoordinate);
        }
    }
}

class Card {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

@Component({
    selector: 'graph',
    templateUrl: 'graph.component.html'
})
export class GraphComponent {
    cards: Card[] = [];
    constructor(private elementRef: ElementRef) { }

    get offsetTop(): number {
        return this.elementRef.nativeElement.offsetTop;
    }

    get canvasHeight(): number {
        return this.elementRef.nativeElement.offsetHeight;
    }

    get canvasWidth(): number {
        return this.elementRef.nativeElement.offsetWidth;
    }

    addCard() {
        this.cards.push(new Card(this.canvasWidth / 2, this.canvasHeight / 2));
    }

    clearCards() {
        this.cards = [];
    }
}