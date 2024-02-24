import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { SerialLinkService } from '../services/serial-link.service';
import { StorageService } from '../services/storage.service';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { EventsService } from '../services/events.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import * as gConst from '../gConst';
import * as gIF from '../gIF'
import { Subscription } from 'rxjs';
import { debounceTime } from "rxjs/operators";

@Component({
    selector: 'app-set-styles',
    templateUrl: './set-styles.page.html',
    styleUrls: ['./set-styles.page.scss'],
})
export class SetStyles implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('testView') testView: ElementRef;
    testEl: HTMLElement;

    //selAttr: gIF.hostedAttr_t;
    minFontSize = 5
    maxFontSize = 50;
    maxBorderWidth = 10;
    maxBorderRadius = 20;
    maxPaddingTop = 20;
    maxPaddingRight = 20;
    maxPaddingBottom = 20;
    maxPaddingLeft = 20;

    //formGroup: FormGroup;
    name: string;
    style = {} as gIF.ngStyle_t;
    valCorr = {} as gIF.valCorr_t;
    selAttr: gIF.hostedAttr_t;

    hasUnits = false;
    unitSel = [];
    unitsCtrl = new FormControl('', Validators.required);

    nameFormCtrl: FormControl;
    offsetFormCtrl: FormControl;
    colorFormCtrl: FormControl;
    bgColorFormCtrl: FormControl;
    fontSizeFormCtrl: FormControl;
    borderColorFormCtrl: FormControl;
    borderWidthFormCtrl: FormControl;
    borderStyleFormCtrl: FormControl;
    borderRadiusFormCtrl: FormControl;
    paddingTopFormCtrl: FormControl;
    paddingRightFormCtrl: FormControl;
    paddingBottomFormCtrl: FormControl;
    paddingLeftFormCtrl: FormControl;

    subscription = new Subscription();


    constructor(public dialogRef: MatDialogRef<SetStyles>,
                @Inject(MAT_DIALOG_DATA) public keyVal: any,
                public events: EventsService,
                public serialLink: SerialLinkService,
                public storage: StorageService,
                private renderer: Renderer2) {
        this.selAttr = this.keyVal.value;
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngAfterViewInit(): void {
        this.testEl = this.testView.nativeElement;
        this.renderer.setStyle(this.testEl, 'color', this.selAttr.style.color);
        this.renderer.setStyle(this.testEl, 'backgroundColor', this.selAttr.style.bgColor);
        this.renderer.setStyle(this.testEl, 'fontSize', `${this.selAttr.style.fontSize}px`);

        this.renderer.setStyle(this.testEl, 'borderColor', this.selAttr.style.borderColor);
        this.renderer.setStyle(this.testEl, 'borderWidth', `${this.selAttr.style.borderWidth}px`);
        this.renderer.setStyle(this.testEl, 'borderStyle', this.selAttr.style.borderStyle);
        this.renderer.setStyle(this.testEl, 'borderRadius', `${this.selAttr.style.borderRadius}px`);

        this.renderer.setStyle(this.testEl, 'paddingTop', `${this.selAttr.style.paddingTop}px`);
        this.renderer.setStyle(this.testEl, 'paddingRight', `${this.selAttr.style.paddingRight}px`);
        this.renderer.setStyle(this.testEl, 'paddingBottom', `${this.selAttr.style.paddingBottom}px`);
        this.renderer.setStyle(this.testEl, 'paddingLeft', `${this.selAttr.style.paddingLeft}px`);
        /*
        this.testView.nativeElement.style.color = this.selAttr.style.color;
        this.testView.nativeElement.style.backgroundColor = this.selAttr.style.bgColor;
        this.testView.nativeElement.style.fontSize = `${this.selAttr.style.fontSize}px`;

        this.testView.nativeElement.style.borderColor = this.selAttr.style.borderColor;
        this.testView.nativeElement.style.borderWidth = `${this.selAttr.style.borderWidth}px`;
        this.testView.nativeElement.style.borderStyle = this.selAttr.style.borderStyle;
        this.testView.nativeElement.style.borderRadius = `${this.selAttr.style.borderRadius}px`;

        this.testView.nativeElement.style.paddingTop = `${this.selAttr.style.paddingTop}px`;
        this.testView.nativeElement.style.paddingRight = `${this.selAttr.style.paddingRight}px`;
        this.testView.nativeElement.style.paddingBottom = `${this.selAttr.style.paddingBottom}px`;
        this.testView.nativeElement.style.paddingLeft = `${this.selAttr.style.paddingLeft}px`;
        */
    }

    ngOnInit() {
        this.name = this.selAttr.name;
        this.valCorr = this.selAttr.valCorr;
        this.style.color = this.selAttr.style.color;
        this.style.bgColor = this.selAttr.style.bgColor;
        this.style.fontSize = this.selAttr.style.fontSize;

        this.style.borderColor = this.selAttr.style.borderColor;
        this.style.borderWidth = this.selAttr.style.borderWidth;
        this.style.borderStyle = this.selAttr.style.borderStyle;
        this.style.borderRadius = this.selAttr.style.borderRadius;

        this.style.paddingTop = this.selAttr.style.paddingTop;
        this.style.paddingRight = this.selAttr.style.paddingRight;
        this.style.paddingBottom = this.selAttr.style.paddingBottom;
        this.style.paddingLeft = this.selAttr.style.paddingLeft;

        this.nameFormCtrl = new FormControl(
            this.name, [Validators.required]
        );
        this.offsetFormCtrl = new FormControl(
            this.valCorr.offset, [Validators.required]
        );

        // color
        this.colorFormCtrl = new FormControl(
            this.style.color, [
                Validators.required
            ]
        );
        const colorSubscription = this.colorFormCtrl.valueChanges.subscribe((color)=>{
            this.renderer.setStyle(this.testEl, 'color', color);
            //this.testView.nativeElement.style.color = color;
        });
        this.subscription.add(colorSubscription);

        // background color
        this.bgColorFormCtrl = new FormControl(
            this.style.bgColor, [
                Validators.required
            ]
        );
        const bgColorSubscription = this.bgColorFormCtrl.valueChanges.subscribe((color)=>{
            this.renderer.setStyle(this.testEl, 'backgroundColor', color);
            //this.testView.nativeElement.style.backgroundColor = color;
        });
        this.subscription.add(bgColorSubscription);

        // font size
        this.fontSizeFormCtrl = new FormControl(
            this.style.fontSize, [
                Validators.required,
                Validators.min(this.minFontSize),
                Validators.max(this.maxFontSize)
            ]
        );
        const fontSizeSubscription = this.fontSizeFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((size)=>{
            if(size > this.minFontSize){
                if(size < this.maxFontSize){
                    this.renderer.setStyle(this.testEl, 'fontSize', `${size}px`);
                    //this.testView.nativeElement.style.fontSize = `${size}px`;
                }
            }
        });
        this.subscription.add(fontSizeSubscription);

        // border color
        this.borderColorFormCtrl = new FormControl(
            this.style.borderColor, [
                Validators.required
            ]
        );
        const borderColorSubscription = this.borderColorFormCtrl.valueChanges.subscribe((color)=>{
            this.renderer.setStyle(this.testEl, 'borderColor', color);
            //this.testView.nativeElement.style.borderColor = color;
        });
        this.subscription.add(borderColorSubscription);

        // border width
        this.borderWidthFormCtrl = new FormControl(
            this.style.borderWidth, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxBorderWidth)
            ]
        );
        const borderWidthSubscription = this.borderWidthFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((width)=>{
            if(width > -1){
                if(width <= this.maxBorderWidth){
                    this.renderer.setStyle(this.testEl, 'borderWidth', `${width}px`);
                    //this.testView.nativeElement.style.borderWidth = `${width}px`;
                }
            }
        });
        this.subscription.add(borderWidthSubscription);

        // border style
        this.borderStyleFormCtrl = new FormControl(
            this.style.borderStyle, [
                Validators.required
            ]
        );
        const borderStyleSubscription = this.borderStyleFormCtrl.valueChanges.subscribe((style)=>{
            switch(style){
                case 'none':
                case 'hidden':
                case 'dotted':
                case 'dashed':
                case 'solid':
                case 'double':
                case 'groove':
                case 'ridge':
                case 'inset':
                case 'outset':
                    this.renderer.setStyle(this.testEl, 'borderStyle', style);
                    //this.testView.nativeElement.style.borderStyle = style;
                    break;
            }
        });
        this.subscription.add(borderStyleSubscription);

        // border radius
        this.borderRadiusFormCtrl = new FormControl(
            this.style.borderRadius, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxBorderRadius)
            ]
        );
        const borderRadiusSubscription = this.borderRadiusFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((radius)=>{
            if(radius > -1){
                if(radius <= this.maxBorderRadius){
                    this.renderer.setStyle(this.testEl, 'borderRadius', `${radius}px`);
                    //this.testView.nativeElement.style.borderRadius = `${radius}px`;
                }
            }
        });
        this.subscription.add(borderRadiusSubscription);

        // padding top
        this.paddingTopFormCtrl = new FormControl(
            this.style.paddingTop, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxPaddingTop)
            ]
        );
        const paddingTopSubscription = this.paddingTopFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((padding)=>{
            if(padding > -1){
                if(padding <= this.maxPaddingTop){
                    this.renderer.setStyle(this.testEl, 'paddingTop', `${padding}px`);
                    //this.testView.nativeElement.style.paddingTop = `${padding}px`;
                }
            }
        });
        this.subscription.add(paddingTopSubscription);

        // padding right
        this.paddingRightFormCtrl = new FormControl(
            this.style.paddingRight, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxPaddingRight)
            ]
        );
        const paddingRightSubscription = this.paddingRightFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((padding)=>{
            if(padding > -1){
                if(padding <= this.maxPaddingRight){
                    this.renderer.setStyle(this.testEl, 'paddingRight', `${padding}px`);
                    //this.testView.nativeElement.style.paddingRight = `${padding}px`;
                }
            }
        });
        this.subscription.add(paddingRightSubscription);

        // padding bottom
        this.paddingBottomFormCtrl = new FormControl(
            this.style.paddingBottom, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxPaddingBottom)
            ]
        );
        const paddingBottomSubscription = this.paddingBottomFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((padding)=>{
            if(padding > -1){
                if(padding <= this.maxPaddingBottom){
                    this.renderer.setStyle(this.testEl, 'paddingBottom', `${padding}px`);
                    //this.testView.nativeElement.style.paddingBottom = `${padding}px`;
                }
            }
        });
        this.subscription.add(paddingBottomSubscription);

        // padding left
        this.paddingLeftFormCtrl = new FormControl(
            this.style.paddingLeft, [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxPaddingLeft)
            ]
        );
        const paddingLeftSubscription = this.paddingLeftFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((padding)=>{
            if(padding > -1){
                if(padding <= this.maxPaddingLeft){
                    this.renderer.setStyle(this.testEl, 'paddingLeft', `${padding}px`);
                    //this.testView.nativeElement.style.paddingLeft = `${padding}px`;
                }
            }
        });
        this.subscription.add(paddingLeftSubscription);

        /*
        this.formGroup = new FormGroup({
            name: new FormControl(
                this.name,
                [
                    Validators.required
                ]
            ),
            offset: new FormControl(
                this.valCorr.offset,
                [
                    Validators.required
                ]
            ),
            color: new FormControl(
                this.style.color,
                [
                    Validators.required
                ]
            ),
            bgColor: new FormControl(
                this.style.bgColor,
                [
                    Validators.required
                ]
            ),
            fontSize: new FormControl(
                this.style.fontSize,
                [
                    Validators.required,
                    Validators.max(this.maxFontSize)
                ]
            ),
            borderColor: new FormControl(
                this.style.borderColor,
                [
                    Validators.required
                ]
            ),
            borderWidth: new FormControl(
                this.style.borderWidth,
                [
                    Validators.required,
                    Validators.max(this.maxBorderWidth)
                ]
            ),
            borderStyle: new FormControl(
                this.style.borderStyle,
                [
                    Validators.required
                ]
            ),
            borderRadius: new FormControl(
                this.style.borderRadius,
                [
                    Validators.required,
                    Validators.max(this.maxBorderRadius)
                ]
            ),
            paddingTop: new FormControl(
                this.style.paddingTop,
                [
                    Validators.required,
                    Validators.max(this.maxPaddingTop)
                ]
            ),
            paddingRight: new FormControl(
                this.style.paddingRight,
                [
                    Validators.required,
                    Validators.max(this.maxPaddingRight)
                ]
            ),
            paddingBottom: new FormControl(
                this.style.paddingBottom,
                [
                    Validators.required,
                    Validators.max(this.maxPaddingBottom)
                ]
            ),
            paddingLeft: new FormControl(
                this.style.paddingLeft,
                [
                    Validators.required,
                    Validators.max(this.maxPaddingLeft)
                ]
            ),
        });
        */

        switch(this.selAttr.clusterID){
            case gConst.CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT: {
                this.hasUnits = true;
                this.unitSel.push({name: 'degC', unit: gConst.DEG_C});
                this.unitSel.push({name: 'degF', unit: gConst.DEG_F});
                this.unitsCtrl.setValue(this.unitSel[0]);
                if(this.selAttr.valCorr.units == gConst.DEG_F){
                    this.unitsCtrl.setValue(this.unitSel[1]);
                }
                break;
            }
            case gConst.CLUSTER_ID_MS_PRESSURE_MEASUREMENT: {
                this.hasUnits = true;
                this.unitSel.push({name: 'mBar', unit: gConst.M_BAR});
                this.unitSel.push({name: 'inHg', unit: gConst.IN_HG});
                this.unitsCtrl.setValue(this.unitSel[0]);
                if(this.selAttr.valCorr.units == gConst.IN_HG){
                    this.unitsCtrl.setValue(this.unitSel[1]);
                }
                break;
            }
        }
    }

    async save() {
        this.name = this.nameFormCtrl.value;
        this.valCorr.units = (this.unitsCtrl.value as any).unit;
        this.valCorr.offset = this.offsetFormCtrl.value;
        this.style.color = this.colorFormCtrl.value;
        this.style.bgColor = this.bgColorFormCtrl.value;
        this.style.fontSize = this.fontSizeFormCtrl.value;
        this.style.borderColor = this.borderColorFormCtrl.value;
        this.style.borderWidth = this.borderWidthFormCtrl.value;
        this.style.borderStyle = this.borderStyleFormCtrl.value;
        this.style.borderRadius = this.borderRadiusFormCtrl.value;
        this.style.paddingTop = this.paddingTopFormCtrl.value;
        this.style.paddingRight = this.paddingRightFormCtrl.value;
        this.style.paddingBottom = this.paddingBottomFormCtrl.value;
        this.style.paddingLeft = this.paddingLeftFormCtrl.value;

        await this.storage.setAttrNameAndStyle(this.name,
                                               this.style,
                                               this.valCorr,
                                               this.keyVal);
        this.dialogRef.close();
    }

    close() {
        this.dialogRef.close();
    }

    nameErr() {
        if(this.nameFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    offsetErr() {
        if(this.offsetFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    colorErr() {
        if(this.colorFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    bgColorErr() {
        if(this.bgColorFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    fontSizeErr() {
        if(this.fontSizeFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.fontSizeFormCtrl.hasError('min')){
            return `font size must be grater than ${this.minFontSize}`;
        }
        if(this.fontSizeFormCtrl.hasError('max')){
            return `font size must be less than ${this.maxFontSize}`;
        }
    }
    borderColorErr() {
        if(this.borderColorFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    borderWidthErr() {
        if(this.borderWidthFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.borderWidthFormCtrl.hasError('min')){
            return `border width must be greater than 0`;
        }
        if(this.borderWidthFormCtrl.hasError('max')){
            return `border width must be less than ${this.maxBorderWidth}`;
        }
    }
    borderStyleErr() {
        if(this.borderStyleFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    borderRadiusErr() {
        if(this.borderRadiusFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.borderRadiusFormCtrl.hasError('min')){
            return `border radius must be greater than 0`;
        }
        if(this.borderRadiusFormCtrl.hasError('max')){
            return `border radius must be less than ${this.maxBorderRadius}`;
        }
    }
    paddingTopErr() {
        if(this.paddingTopFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.paddingTopFormCtrl.hasError('min')){
            return `padding top must be greater than 0`;
        }
        if(this.paddingTopFormCtrl.hasError('max')){
            return `padding top must be less than ${this.maxPaddingTop}`;
        }
    }
    paddingRightErr() {
        if(this.paddingRightFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.paddingRightFormCtrl.hasError('min')){
            return `padding right must be greater than 0`;
        }
        if(this.paddingRightFormCtrl.hasError('max')){
            return `padding right must be less than ${this.maxPaddingRight}`;
        }
    }
    paddingBottomErr() {
        if(this.paddingBottomFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.paddingBottomFormCtrl.hasError('min')){
            return `padding bottom must be greater than 0`;
        }
        if(this.paddingBottomFormCtrl.hasError('max')){
            return `padding bottom must be less than ${this.maxPaddingBottom}`;
        }
    }
    paddingLeftErr() {
        if(this.paddingLeftFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.paddingLeftFormCtrl.hasError('min')){
            return `padding left must be greater than 0`;
        }
        if(this.paddingLeftFormCtrl.hasError('max')){
            return `padding left must be less than ${this.maxPaddingLeft}`;
        }
    }
    /*
    colorChange(event){
        this.testView.nativeElement.style.color = event.target.value;
    }

    bgColorChange(event){
        this.testView.nativeElement.style.backgroundColor = event.target.value;
    }
    fontSizeChange(event){
        this.testView.nativeElement.style.fontSize = `${event.target.value}px`;
    }
    borderColorChange(event){
        this.testView.nativeElement.style.borderColor = event.target.value;
    }
    borderWidthChange(event){
        this.testView.nativeElement.style.borderWidth = `${event.target.value}px`;
    }
    borderStyleChange(event){
        this.testView.nativeElement.style.borderStyle = event.target.value;
    }
    borderRadiusChange(event){
        this.testView.nativeElement.style.borderRadius = `${event.target.value}px`;
    }
    paddingTopChange(event){
        this.testView.nativeElement.style.paddingTop = `${event.target.value}px`;
    }
    paddingRightChange(event){
        this.testView.nativeElement.style.paddingRight = `${event.target.value}px`;
    }
    paddingBottomChange(event){
        this.testView.nativeElement.style.paddingBottom = `${event.target.value}px`;
    }
    paddingLeftChange(event){
        this.testView.nativeElement.style.paddingLeft = `${event.target.value}px`;
    }
    */
    /***********************************************************************************************
     * @fn          unitsChanged
     *
     * @brief
     *
     */
    unitsChanged(event){
        //console.log(event);
    }

    /***********************************************************************************************
     * @fn          isValid
     *
     * @brief
     *
     */
    isValid(){
        if(this.nameFormCtrl.invalid){
            return false;
        }
        if(this.offsetFormCtrl.invalid){
            return false;
        }
        if(this.colorFormCtrl.invalid){
            return false;
        }
        if(this.bgColorFormCtrl.invalid){
            return false;
        }
        if(this.fontSizeFormCtrl.invalid){
            return false;
        }
        if(this.borderColorFormCtrl.invalid){
            return false;
        }
        if(this.borderWidthFormCtrl.invalid){
            return false;
        }
        if(this.borderStyleFormCtrl.invalid){
            return false;
        }
        if(this.borderRadiusFormCtrl.invalid){
            return false;
        }
        if(this.paddingTopFormCtrl.invalid){
            return false;
        }
        if(this.paddingRightFormCtrl.invalid){
            return false;
        }
        if(this.paddingBottomFormCtrl.invalid){
            return false;
        }
        if(this.paddingLeftFormCtrl.invalid){
            return false;
        }
        return true;
    }

}
