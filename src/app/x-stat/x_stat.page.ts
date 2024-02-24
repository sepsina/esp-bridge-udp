import { Component, Inject, NgZone, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { SerialLinkService } from '../services/serial-link.service';
import { StorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';
import { Validators, FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import * as gConst from '../gConst';
import * as gIF from '../gIF'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

const EMPTY_NAME = '--- empty ---';

@Component({
    selector: 'app-stats',
    templateUrl: './x_stat.page.html',
    styleUrls: ['./x_stat.page.scss'],
})
export class EditStats implements AfterViewInit {

    @ViewChild('onOffBoxRef', {read: ElementRef, static:false}) onOffBoxRef: ElementRef;
    @ViewChild('usedWrapRef', {read: ElementRef, static:false}) wrapRef: ElementRef;

    thermostatDesc: gIF.descVal_t[] = [];

    selThermostat: gIF.thermostat_t;
    thermostats: gIF.thermostat_t[] = [];
    on_off_all: gIF.on_off_actuator_t[] = [];
    on_off_used: gIF.on_off_actuator_t[] = [];

    setPointFormCtrl = new FormControl(0, [Validators.required]);

    constructor(private dialogRef: MatDialogRef<EditStats>,
                @Inject(MAT_DIALOG_DATA) public dlgData: any,
                private serial: SerialLinkService,
                private storage: StorageService,
                private utils: UtilsService,
                private ngZone: NgZone) {
        // ---
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
     ngAfterViewInit(){
        setTimeout(() => {
            this.refresh();
        }, 0);
    }

    /***********************************************************************************************
     * fn          refresh
     *
     * brief
     *
     */
    refresh() {

        let attribs: gIF.hostedAttr_t[] = JSON.parse(JSON.stringify(Array.from(this.storage.attrMap.values())));

        this.thermostats = [];
        this.on_off_all = [];
        this.on_off_used = [];

        for(const attr of attribs){
            if(attr.clusterID === gConst.CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT){
                let thermostat = {} as gIF.thermostat_t;
                thermostat.name = attr.name;
                thermostat.ip = attr.ip;
                thermostat.port = attr.port;
                thermostat.partNum = attr.partNum;
                thermostat.extAddr = attr.extAddr;
                thermostat.shortAddr = attr.shortAddr;
                thermostat.endPoint = attr.endPoint;
                thermostat.hysteresis = gConst.THERMOSTAT_HYSTERESIS;
                thermostat.actuators = [];
                const key = this.storage.thermostatKey(attr.extAddr, attr.endPoint);
                const nvThermostat: gIF.thermostat_t = this.storage.nvThermostatsMap.get(key);
                if(nvThermostat){
                    thermostat.setPoint = nvThermostat.setPoint;
                    thermostat.prevSetPoint = nvThermostat.prevSetPoint;
                    thermostat.workPoint = nvThermostat.workPoint;
                    thermostat.actuators = [...nvThermostat.actuators];
                }
                else {
                    thermostat.setPoint = 20.0;
                    thermostat.prevSetPoint = 0;
                    thermostat.workPoint = 20.0;
                    thermostat.actuators = [];
                }
                this.thermostats.push(thermostat);
            }
            if(attr.clusterServer){
                if(attr.clusterID === gConst.CLUSTER_ID_GEN_ON_OFF){
                    let on_off_actuator = {} as gIF.on_off_actuator_t;
                    on_off_actuator.valid = true;
                    on_off_actuator.name = attr.name;
                    on_off_actuator.ip = attr.ip;
                    on_off_actuator.port = attr.port;
                    on_off_actuator.partNum = attr.partNum;
                    on_off_actuator.extAddr = attr.extAddr;
                    on_off_actuator.shortAddr = attr.shortAddr;
                    on_off_actuator.endPoint = attr.endPoint;
                    this.on_off_all.push(on_off_actuator);
                }
            }
        }

        this.storage.delAllThermostat();
        for(const thermostat of this.thermostats){
            this.storage.storeThermostat(thermostat);
        }

        if(this.thermostats.length > 0){
            this.selThermostat = this.thermostats[0];
            this.setPointFormCtrl.setValue(this.selThermostat.setPoint);
            this.ngZone.run(()=>{
                this.setThermostat(this.selThermostat);
            });
            this.setThermostatDesc(this.selThermostat);
        }
        else {
            this.on_off_all = [];
            this.on_off_used = [];
            this.putEmpties();
        }

        setTimeout(() => {
            const boxHeight = this.onOffBoxRef.nativeElement.offsetHeight;
            let boxNum = this.on_off_used.length;
            if(boxNum > 4){
                boxNum = 4;
            }
            const wrapHeight = boxNum * boxHeight;
            this.wrapRef.nativeElement.style.height = `${wrapHeight}px`;
        }, 200);
    }

    /***********************************************************************************************
     * fn          setThermostat
     *
     * brief
     *
     */
    setThermostat(thermostat: gIF.thermostat_t){

        for(const on_off of this.on_off_used){
            this.on_off_all.push(on_off);
        }
        this.on_off_used = [];

        for(const actuator of thermostat.actuators){
            for(let i = 0; i < this.on_off_all.length; i++){
                if(this.on_off_all[i].extAddr === actuator.extAddr){
                    if(this.on_off_all[i].endPoint === actuator.endPoint){
                        const used = this.on_off_all.splice(i, 1)[0];
                        this.on_off_used.push(used);
                    }
                }
            }
        }
        thermostat.actuators = [];
        for(const on_off of this.on_off_used){
            const actuator = {} as gIF.thermostatActuator_t;
            actuator.name = on_off.name;
            actuator.ip = on_off.ip;
            actuator.port = on_off.port;
            actuator.extAddr = on_off.extAddr;
            actuator.endPoint = on_off.endPoint;
            thermostat.actuators.push(actuator);
        }

        this.storage.storeThermostat(thermostat);

        this.putEmpties();
    }

    /***********************************************************************************************
     * fn          thermostatSelected
     *
     * brief
     *
     */
    public thermostatSelected(event: MatSelectChange){

        this.setPointFormCtrl.setValue(this.selThermostat.setPoint);
        this.setThermostatDesc(this.selThermostat);

        this.ngZone.run(()=>{
            this.setThermostat(this.selThermostat);
        });
    }

    /***********************************************************************************************
     * fn          setThermostatDesc
     *
     * brief
     *
     */
    public setThermostatDesc(thermostat: gIF.thermostat_t){

        this.thermostatDesc = [];
        let partDesc: gIF.part_t = this.dlgData.partMap.get(thermostat.partNum);
        if(partDesc){
            let descVal = {} as gIF.descVal_t;
            descVal.key = 'S/N:';
            descVal.value = this.utils.extToHex(thermostat.extAddr);
            this.thermostatDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'node-name:';
            descVal.value = partDesc.devName;
            this.thermostatDesc.push(descVal);
            descVal = {} as gIF.descVal_t;
            descVal.key = 'label:';
            descVal.value = partDesc.part;
            this.thermostatDesc.push(descVal);
        }
    }

    /***********************************************************************************************
     * fn          showTooltip
     *
     * brief
     *
     */
    showTooltip(tt: MatTooltip,
                on_off: gIF.on_off_actuator_t){
        let ttMsg = '';
        ttMsg += `S/N: ${this.utils.extToHex(on_off.extAddr)} \n`;
        let partDesc: gIF.part_t = this.dlgData.partMap.get(on_off.partNum);
        if(partDesc){
            ttMsg += `node-name: ${partDesc.devName} \n`;
            ttMsg += `part: ${partDesc.part} \n`;
            ttMsg += `url: ${partDesc.url} \n`;
        }
        tt.message = ttMsg;
        tt.showDelay = 500;
        tt.tooltipClass = "bind-tooltip";
        tt.show();
    }

    /***********************************************************************************************
     * fn          close
     *
     * brief
     *
     */
    close() {
        this.dialogRef.close();
    }

    /***********************************************************************************************
     * fn          usedDrop
     *
     * brief
     *
     */
    usedDrop(event: CdkDragDrop<any[]>) {

        let idx = 0;
        let len = 0;
        let fullFlag = true;

        const empty = {} as gIF.on_off_actuator_t;
        empty.valid = false;
        empty.name = EMPTY_NAME;

        if(event.previousContainer !== event.container){
            idx = 0;
            len = this.on_off_used.length;
            fullFlag = true;
            while(idx < len){
                if(this.on_off_used[idx].name === EMPTY_NAME){
                    fullFlag = false;
                    break;
                }
                idx++;
            }
            if(fullFlag === true){
                return;
            }

            const on_off = this.on_off_all.splice(event.previousIndex, 1, empty)[0];
            this.on_off_used.splice(event.currentIndex, 0, on_off); // insert

            let done = false;
            idx = event.currentIndex + 1;
            len = this.on_off_used.length
            while(idx < len){
                if(this.on_off_used[idx].name == EMPTY_NAME){
                    this.on_off_used.splice(idx, 1);
                    done = true;
                    break;
                }
                idx++;
            }
            if(done == false){
                idx = 0;
                while(idx < event.currentIndex){
                    if(this.on_off_used[idx].name == EMPTY_NAME){
                        this.on_off_used.splice(idx, 1);
                        break;
                    }
                    idx++;
                }
            }

            let actuator = {} as gIF.thermostatActuator_t;
            actuator.name = on_off.name;
            actuator.ip = on_off.ip;
            actuator.port = on_off.port;
            actuator.extAddr = on_off.extAddr;
            actuator.endPoint = on_off.endPoint;

            this.selThermostat.actuators.push(actuator);
            this.storage.storeThermostat(this.selThermostat);
        }
        else {
            moveItemInArray(event.container.data,
                            event.previousIndex,
                            event.currentIndex);
        }
    }

    /***********************************************************************************************
     * fn          freeDrop
     *
     * brief
     *
     */
    freeDrop(event: CdkDragDrop<any[]>) {

        let idx = 0;
        let len = 0;

        const empty = {} as gIF.on_off_actuator_t;
        empty.valid = false;
        empty.name = EMPTY_NAME;

        if(event.previousContainer !== event.container){
            const on_off = this.on_off_used.splice(event.previousIndex, 1, empty)[0];
            this.on_off_all.splice(event.currentIndex, 0, on_off); // insert

            let done = false;
            idx = event.currentIndex + 1;
            len = this.on_off_all.length
            while(idx < len){
                if(this.on_off_all[idx].name == EMPTY_NAME){
                    this.on_off_all.splice(idx, 1);
                    done = true;
                    break;
                }
                idx++;
            }
            if(done == false){
                idx = 0;
                while(idx < event.currentIndex){
                    if(this.on_off_all[idx].name == EMPTY_NAME){
                        this.on_off_all.splice(idx, 1);
                        break;
                    }
                    idx++;
                }
            }
            idx = 0;
            len = this.selThermostat.actuators.length;
            while(idx < len){
                if(this.selThermostat.actuators[idx].extAddr === on_off.extAddr){
                    if(this.selThermostat.actuators[idx].endPoint === on_off.endPoint){
                        this.selThermostat.actuators.splice(idx, 1);
                        break;
                    }
                }
                idx++;
            }
            this.storage.storeThermostat(this.selThermostat);
        }
        else {
            moveItemInArray(event.container.data,
                            event.previousIndex,
                            event.currentIndex);
        }
    }

    /***********************************************************************************************
     * fn          putEmpties
     *
     * brief
     *
     */
    putEmpties(){

        for(let i = this.on_off_used.length; i < 6; i++){
            let on_off = {} as gIF.on_off_actuator_t;
            on_off.valid = false;
            on_off.name = EMPTY_NAME;
            this.on_off_used.push(on_off);
        }
        for(let i = this.on_off_all.length; i < 12; i++){
            let on_off = {} as gIF.on_off_actuator_t;
            on_off.valid = false;
            on_off.name = EMPTY_NAME;
            this.on_off_all.push(on_off);
        }
    }

    /***********************************************************************************************
     * @fn          setPointErr
     *
     * @brief
     *
     */
    setPointErr() {
        if(this.setPointFormCtrl.hasError('required')){
            return 'You must enter a value';
        }
    }

    /***********************************************************************************************
     * @fn          yPosChange
     *
     * @brief
     *
     */
    spChange(event) {
        console.log(event.target.value);
        this.selThermostat.setPoint = parseFloat(event.target.value);
        this.storage.storeThermostat(this.selThermostat);
    }
}
