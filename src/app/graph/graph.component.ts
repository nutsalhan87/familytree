import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';

@Component({
    selector: 'graph',
    templateUrl: 'graph.component.html',
    styleUrls: ['graph.component.scss']
})
export class GraphComponent implements AfterViewInit {
    // @ViewChildren(CardComponent) cards!: QueryList<CardComponent>;
    mouseX: number = 0;
    mouseY: number = 0;
    // @ViewChild('field') field!: ElementRef;
    isDragging: boolean = false;
    isDraggingBlocked: boolean = false;
    constructor(private elementRef: ElementRef<HTMLElement>) { }

    ngAfterViewInit() {
        // this.field.nativeElement.style.left = '0px';
        // this.field.nativeElement.style.top = '0px';
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            // let left: number = parseFloat((this.field.nativeElement.style.left as string).slice(0, -2));
            // let top: number = parseFloat((this.field.nativeElement.style.top as string).slice(0, -2));
            // this.field.nativeElement.style.left = (left + event.clientX - this.mouseX).toString().concat('px');
            // this.field.nativeElement.style.top = (top + event.clientY - this.mouseY).toString().concat('px');
        }
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    @HostListener('mousedown')
    startDragging() {
        if (!this.isDraggingBlocked) {
            this.isDragging = true;
        }
    }

    @HostListener('mouseup')
    stopDragging() {
        this.isDragging = false;
    }
    
    get offsetTop(): number {
        return this.elementRef.nativeElement.offsetTop;
    }
    
    get canvasHeight(): number {
        return this.elementRef.nativeElement.offsetHeight;
    }
    
    get canvasWidth(): number {
        return this.elementRef.nativeElement.offsetWidth;
    }
    
    blockDragging() {
        this.isDraggingBlocked = true;
    }

    unblockDragging() {
        this.isDraggingBlocked = false;
    }

    addCard() {
        // this.cards.push(new CardComponent(this.canvasWidth / 2, this.canvasHeight / 2));
    }

    clearCards() {
        // this.cards = [];
    }
}