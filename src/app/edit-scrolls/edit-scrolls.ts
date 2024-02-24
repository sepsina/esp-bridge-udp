import {Component, Inject, OnInit, AfterViewInit, NgZone, OnDestroy, ApplicationRef } from '@angular/core';
import { EventsService } from '../services/events.service';
import { Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as gIF from '../gIF'

import { Subscription } from 'rxjs';
import { debounceTime } from "rxjs/operators";

@Component({
    selector: 'app-edit-scrolls',
    templateUrl: './edit-scrolls.html',
    styleUrls: ['./edit-scrolls.css']
})
export class EditScrolls implements OnInit, AfterViewInit, OnDestroy {

    minPos = 0;
    maxPos = 100;

    scrollFormCtrl: FormControl;
    nameFormCtrl: FormControl;
    yPosFormCtrl: FormControl;
    subscription = new Subscription;

    scrolls: gIF.scroll_t[] = [];
    newIdx: number = 0;


    constructor(private dialogRef: MatDialogRef<EditScrolls>,
                @Inject(MAT_DIALOG_DATA) public dlgData: any,
                private events: EventsService,
                private ngZone: NgZone,
                private appRef: ApplicationRef) {
        // ---
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    /***********************************************************************************************
     * @fn          ngOnInit
     *
     * @brief
     *
     */
    ngOnInit(): void {

        this.dlgData.scrolls.shift();
        for(let i = 0; i < this.dlgData.scrolls.length; i++){
            let scroll = {} as gIF.scroll_t;
            scroll.name = this.dlgData.scrolls[i].name;
            scroll.yPos = this.dlgData.scrolls[i].yPos;
            this.scrolls.push(scroll);
        }
        this.scrollFormCtrl = new FormControl(
            '',
            [
                Validators.required
            ]
        );
        const scrollSubscription = this.scrollFormCtrl.valueChanges.subscribe((scroll: gIF.scroll_t)=>{
            if(scroll){
                this.nameFormCtrl.setValue(scroll.name);
                this.yPosFormCtrl.setValue(scroll.yPos);
                //this.yPosSet(scroll.yPos);
            }
        });
        this.subscription.add(scrollSubscription);

        this.nameFormCtrl = new FormControl(
            '',
            [
                Validators.required
            ]
        );
        const nameSubscription = this.nameFormCtrl.valueChanges.subscribe((name)=>{
            this.nameFormCtrl.markAsTouched();
            (<gIF.scroll_t>this.scrollFormCtrl.value).name = name;
        });
        this.subscription.add(nameSubscription);

        this.yPosFormCtrl = new FormControl(
            0,
            [
                Validators.required,
                Validators.min(0),
                Validators.max(this.maxPos)
            ]
        );
        const yPosSubscription = this.yPosFormCtrl.valueChanges.pipe(debounceTime(0)).subscribe((pos)=>{
            this.yPosFormCtrl.markAsTouched();
            (<gIF.scroll_t>this.scrollFormCtrl.value).yPos = pos;
            if(pos) {
                if(pos >= 0) {
                    if(pos <= this.maxPos) {
                        this.yPosSet(pos);
                    }
                }
            }
        });
        this.subscription.add(yPosSubscription);

    }
    /***********************************************************************************************
     * @fn          ngAfterViewInit
     *
     * @brief
     *
     */
    ngAfterViewInit(): void {

        setTimeout(() => {
            const scroll = this.scrolls[0];
            if(scroll) {
                this.ngZone.run(()=>{
                    this.scrollFormCtrl.setValue(scroll);
                    this.nameFormCtrl.setValue(scroll.name);
                    this.yPosFormCtrl.setValue(scroll.yPos);
                    //this.yPosSet(scroll.yPos);
                });
            }
        }, 0);
    }
    /***********************************************************************************************
     * @fn          save
     *
     * @brief
     *
     */
    save() {

        let validScrolls = [];

        for(const scroll of this.scrolls){
            if(scroll.name){
                if(scroll.yPos !== null) {
                    if(scroll.yPos >= 0){
                        if(scroll.yPos <= this.maxPos){
                            validScrolls.push(scroll);
                        }
                    }
                }
            }
        }
        this.dialogRef.close(validScrolls);
    }
    /***********************************************************************************************
     * @fn          close
     *
     * @brief
     *
     */
    close() {
        this.dialogRef.close();
    }
    /***********************************************************************************************
     * @fn          nameErr
     *
     * @brief
     *
     */
    nameErr() {
        if(this.nameFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }
    /***********************************************************************************************
     * @fn          posErr
     *
     * @brief
     *
     */
    posErr() {
        if(this.yPosFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
        if(this.yPosFormCtrl.hasError('min')){
            return `position must be >= 0`;
        }
        if(this.yPosFormCtrl.hasError('max')){
            return `position must be <= ${this.maxPos} %`;
        }
    }

    /***********************************************************************************************
     * @fn          nameChange
     *
     * @brief
     *
     */
    nameChange(event) {

        let name = event.target.value;
        const scroll = this.scrollFormCtrl.value;
        if(name){
            if(scroll){
                scroll.name = name;
            }
        }
    }
    /***********************************************************************************************
     * @fn          yPosChange
     *
     * @brief
     *
     */
    yPosChange(event) {
        console.log(event.target.value);
        //let pos = event.target.value;
        this.yPosSet(event.target.value);
    }

    /***********************************************************************************************
     * @fn          yPosChange
     *
     * @brief
     *
     */
    yPosSet(pos: number) {

        console.log(`yPos: ${pos}`);

        if(pos < 0){
            pos = 0;
        }
        if(pos > this.maxPos){
            return;
        }

        this.dlgData.scrollRef.scrollTo({
            top: pos * this.dlgData.imgDim.height / 100,
            left: 0,
            behavior: 'smooth'
        });

        const scroll = this.scrollFormCtrl.value;
        if(scroll){
            scroll.yPos = pos;
        }
    }

    /***********************************************************************************************
     * @fn          addScroll
     *
     * @brief
     *
     */
    addScroll(){

        let scroll = {} as gIF.scroll_t;
        scroll.name = `new_${this.newIdx++}`;
        this.newIdx++;
        scroll.yPos = 1;

        this.scrolls.push(scroll);
        this.scrollFormCtrl.setValue(scroll);
    }
    /***********************************************************************************************
     * @fn          delScroll
     *
     * @brief
     *
     */
    delScroll(){

        const scroll = this.scrollFormCtrl.value;
        let selIdx = this.scrolls.findIndex(item => item === scroll);
        if(selIdx > -1){
            this.scrolls.splice(selIdx, 1);
            selIdx--;
            if(selIdx == -1){
                if(this.scrolls.length){
                    selIdx = 0;
                }
            }
            if(selIdx > -1){
                const scroll = this.scrolls[selIdx];
                this.scrollFormCtrl.setValue(scroll);
            }
            else {
                this.scrollFormCtrl.reset();
            }
        }
    }
    /***********************************************************************************************
     * @fn          selChanged
     *
     * @brief
     *
     *
    selChanged(event){
        console.log(event);
        this.yPosSet(event.value.yPos);
    }
    */
}
