import { Directive, ElementRef, HostListener, AfterViewInit} from '@angular/core';
//import { EventsService } from '../events.service';
import { SerialLinkService } from '../services/serial-link.service';
//import * as gConst from '../gConst';
//import * as gIF from '../gIF'

@Directive({
    selector: '[highlightSel]'
})
export class HighlightSel implements AfterViewInit{
    bgColor: string;
    color: string;

    constructor(public elRef: ElementRef,
                public selialLink: SerialLinkService) {

    }

    ngAfterViewInit(): void {
        this.bgColor = this.elRef.nativeElement.style.backgroundColor;
        this.color = this.elRef.nativeElement.style.color;
    }

    @HostListener('mouseenter') onMouseEnter() {
        this.bgColor = this.elRef.nativeElement.style.backgroundColor;
        this.color = this.elRef.nativeElement.style.color;

        this.elRef.nativeElement.style.backgroundColor = 'yellow';
        this.elRef.nativeElement.style.color = 'black';

        //this.selialLink.selElementRef = this.elRef;
    }

    @HostListener('mouseleave') onMouseLeave() {
        this.elRef.nativeElement.style.backgroundColor = this.bgColor;
        this.elRef.nativeElement.style.color = this.color;
    }

}
