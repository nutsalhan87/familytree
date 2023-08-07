interface ButtonClass {
    isActive: boolean;
    switchClass(): void;
    get btnClass(): string;
}

export class ButtonClassPrimary implements ButtonClass {
    isActive: boolean;

    public constructor(isActive: boolean) {
        this.isActive = isActive;
    }
    
    switchClass(): void {
        this.isActive = !this.isActive;
    }
    
    get btnClass(): string {
        return this.isActive ? "btn-primary" : "btn-outline-primary";
    }
}

export class ButtonClassSuccess implements ButtonClass {
    isActive: boolean;

    public constructor(isActive: boolean) {
        this.isActive = isActive;
    }
    
    switchClass(): void {
        this.isActive = !this.isActive;
    }
    
    get btnClass(): string {
        return this.isActive ? "btn-success" : "btn-outline-success";
    }
}