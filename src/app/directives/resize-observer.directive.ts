// from erhise -> https://stackblitz.com/edit/angular-resize-observer
import { Directive, ElementRef, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
//import ResizeObserver from 'resize-observer-polyfill';

const entriesMap = new WeakMap();

const ro = new ResizeObserver((entries)=>{
    for(const entry of entries) {
        if(entriesMap.has(entry.target)){
            const comp = entriesMap.get(entry.target);
            if(comp.tmo){
                clearTimeout(comp.tmo);
            }
            comp.tmo = setTimeout(()=>{
                comp.tmo = null;
                comp._resizeCallback(entry);
            }, 100);
        }
    }
});

@Directive({ selector: '[resizeObserver]' })
export class ResizeObserverDirective implements OnDestroy {

    @Output() resize = new EventEmitter();
    tmo = null;

    constructor(private el: ElementRef) {
        const target = this.el.nativeElement;
        entriesMap.set(target, this);
        ro.observe(target);
    }

    _resizeCallback(entry) {
        //console.log(entry.contentRect);
        this.resize.emit(entry);
    }

    ngOnDestroy() {
        const target = this.el.nativeElement;
        ro.unobserve(target);
        entriesMap.delete(target);
    }
}
