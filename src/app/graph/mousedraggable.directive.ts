import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";

@Directive({
    selector: '[mouseDraggable]'
})
export class MouseDraggableDirective {
    @HostBinding('style.left.px') left: number = 0;
    @HostBinding('style.top.px') top: number = 0;
    startX: number = 0;
    startY: number = 0;
    isDragging = false;
    @Output() blockParentDragging = new EventEmitter<void>();
    @Output() unblockParentDragging = new EventEmitter<void>();
    constructor() { }

    @Input()
    set x(x: number) {
        if (this.isDragging) {
            let moveX = x - this.startX;
            this.startX = x;
            this.left += moveX;
        }
    }

    @Input()
    set y(y: number) {
        if (this.isDragging) {
            let moveY = y - this.startY;
            this.startY = y;
            this.top += moveY;
        }
    }

    @HostListener('mousedown', ['$event'])
    makeDragging(event: MouseEvent) {
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.isDragging = true;
        this.blockParentDragging.emit();
    }

    @HostListener('mouseup')
    makeNotDragging() {
        this.isDragging = false;
        this.unblockParentDragging.emit();
    }
}