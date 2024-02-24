import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, NgZone, OnDestroy, Renderer2 } from '@angular/core';
import { EventsService } from './services/events.service';
import { SerialLinkService } from './services/serial-link.service';
import { UdpService } from './services/udp.service';
import { StorageService } from './services/storage.service';
import { UtilsService } from './services/utils.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';

import { SetStyles } from './set-styles/set-styles.page';
import { EditScrolls } from './edit-scrolls/edit-scrolls';
import { EditFreeDNS } from './edit-freeDNS/edit-freeDNS';
import { EditBinds } from './binds/binds.page';
import { EditStats } from './x-stat/x_stat.page';

import * as gConst from './gConst';
import * as gIF from './gIF';

import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { DialogConfig } from '@angular/cdk/dialog';
import { environment } from 'src/environments/environment';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of, throwError } from 'rxjs';
import { ShowLogs } from './logs/show-logs';

const DUMMY_SCROLL = '- scroll -';
const dumyScroll: gIF.scroll_t = {
    name: DUMMY_SCROLL,
    yPos: 0
}

const wait_msg = '--------';


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('containerRef') containerRef: ElementRef;
    @ViewChild('floorPlanRef') floorPlanRef: ElementRef;

    bkgImgWidth: number;
    bkgImgHeight: number;
    imgUrl: string;
    imgDim = {} as gIF.imgDim_t;
    planPath = '';

    scrolls: gIF.scroll_t[] = [
        dumyScroll,
        {
            name: 'floor-1',
            yPos: 10
        },
        {
            name: 'floor-2',
            yPos: 50
        },
    ];

    selScroll = this.scrolls[0];

    partDesc: gIF.partDesc_t[] = [];
    partMap = new Map();

    dragFlag = false;

    progressFlag = false;
    waitMsg = 'wait';
    msgIdx = 0;

    constructor(private events: EventsService,
                private serialLink: SerialLinkService,
                private udp: UdpService,
                public storage: StorageService,
                private matDialog: MatDialog,
                private ngZone: NgZone,
                public utils: UtilsService,
                private httpClient: HttpClient,
                private renderer: Renderer2) {
        // ---
    }

    /***********************************************************************************************
     * fn          ngAfterViewInit
     *
     * brief
     *
     */
    ngAfterViewInit() {
        this.init();
    }

    /***********************************************************************************************
     * fn          ngOnInit
     *
     * brief
     *
     */
    ngOnInit() {
        window.onbeforeunload = async ()=>{
            this.udp.closeSocket();
            this.serialLink.closeSocket();
        };

        this.events.subscribe('temp_event', (event: gIF.tempEvent_t)=>{
            this.tempEvent(event);
        });
    }

    /***********************************************************************************************
     * fn          ngOnDestroy
     *
     * brief
     *
     */
    ngOnDestroy() {
        // ---
    }

    /***********************************************************************************************
     * fn          init
     *
     * brief
     *
     */
    init() {

        const partsURL = '/assets/parts.json';
        /*
        fetch(partsURL).then(
            (rsp)=>{
                rsp.json().then(
                    (parts)=>{
                        this.partDesc = parts;
                        for(let desc of this.partDesc) {
                            let part = {} as gIF.part_t;
                            part.devName = desc.devName;
                            part.part = desc.part;
                            part.url = desc.url;
                            this.partMap.set(desc.partNum, part);
                        }
                        console.log(JSON.stringify(this.partDesc));
                    },
                    (err)=>{
                        console.log('[ err ] failed to fetch parts');
                    }
                );
            },
            (err)=>{
                console.log(err);
            }
        );
        */
        this.httpClient.get(partsURL).subscribe({
            next: (parts: gIF.partDesc_t[])=>{
                this.partDesc = [];
                this.partMap.clear();
                for(let desc of parts){
                    this.partDesc.push(desc);
                    let part = {} as gIF.part_t;
                    part.devName = desc.devName;
                    part.part = desc.part;
                    part.url = desc.url;
                    this.partMap.set(desc.partNum, part);
                }
                console.log(JSON.stringify(this.partDesc));
            },
            error: (err: HttpErrorResponse)=>{
                console.log(err.message);
            }
        });

        const bkgImgPath = '/assets/floor_plan.jpg';
        let bkgImg = new Image();
        bkgImg.onload = ()=>{
            this.bkgImgWidth = bkgImg.width;
            this.bkgImgHeight = bkgImg.height;
            const el = this.containerRef.nativeElement;
            let divDim = el.getBoundingClientRect();
            this.imgDim.width = divDim.width;
            this.imgDim.height = Math.round((divDim.width / bkgImg.width) * bkgImg.height);
            this.renderer.setStyle(el, 'height', `${this.imgDim.height}px`);
            this.renderer.setStyle(el, 'backgroundImage', `url(${bkgImgPath})`);
            this.renderer.setStyle(el, 'backgroundAttachment', 'scroll');
            this.renderer.setStyle(el, 'backgroundRepeat', 'no-repeat');
            this.renderer.setStyle(el, 'backgroundSize', 'contain');
        };
        bkgImg.src = bkgImgPath;
        /*
        try {
            let partsPath = './src/assets/parts.json';
            if(environment.production) {
                partsPath = './assets/parts.json'
            }
            const fs = window.nw.require('fs');
            let parts = fs.readFileSync(partsPath, 'utf8');
            this.partDesc = JSON.parse(parts);
            for(let desc of this.partDesc) {
                let part = {} as gIF.part_t;
                part.devName = desc.devName;
                part.part = desc.part;
                part.url = desc.url;
                this.partMap.set(desc.partNum, part);
            }
            console.log(JSON.stringify(this.partDesc));
        }
        catch (err) {
            console.log('read parts err: ' + JSON.stringify(err));
        }
        */
        //this.scrolls = [];
        //const scrolls = await this.ns.getScrolls();
        //this.scrolls = JSON.parse(this.storage.getScrolls());
    }

    /***********************************************************************************************
     * fn          getAttrStyle
     *
     * brief
     *
     */
    getAttrStyle(attr: any) {

        let attrStyle = attr.value.style;
        let retStyle = {
            color: attrStyle.color,
            'background-color': attrStyle.bgColor,
            'font-size.px': attrStyle.fontSize,
            'border-color': attrStyle.borderColor,
            'border-width.px': attrStyle.borderWidth,
            'border-style': attrStyle.borderStyle,
            'border-radius.px': attrStyle.borderRadius,
            'padding-top.px': attrStyle.paddingTop,
            'padding-right.px': attrStyle.paddingRight,
            'padding-bottom.px': attrStyle.paddingBottom,
            'padding-left.px': attrStyle.paddingLeft,
        };
        if(attr.value.isValid == false) {
            retStyle.color = 'gray';
            retStyle['background-color'] = 'transparent';
            retStyle['border-color'] = 'gray';
            retStyle['border-width.px'] = 2;
            retStyle['border-style'] = 'dotted';
        }
        return retStyle;
    }

    /***********************************************************************************************
     * fn          getAttrPosition
     *
     * brief
     *
     */
    getAttrPosition(attr: any) {

        if(attr.value.drag){
            return undefined;
        }
        let attrPos = attr.value.pos;

        return {
            x: attrPos.x * this.imgDim.width,
            y: attrPos.y * this.imgDim.height,
        };
    }

    /***********************************************************************************************
     * fn          setBkgImg
     *
     * brief
     *
     *
    setBkgImg() {

        let bkgImg = new Image();
        bkgImg.onload = ()=>{
            this.bkgImgWidth = bkgImg.width;
            this.bkgImgHeight = bkgImg.height;
            const el = this.containerRef.nativeElement;
            let divDim = el.getBoundingClientRect();
            this.imgDim.width = divDim.width;
            this.imgDim.height = Math.round((divDim.width / bkgImg.width) * bkgImg.height);
            this.renderer.setStyle(el, 'height', `${this.imgDim.height}px`);
            this.renderer.setStyle(el, 'backgroundImage', `url(${bkgImgPath})`);
            this.renderer.setStyle(el, 'backgroundAttachment', 'scroll');
            this.renderer.setStyle(el, 'backgroundRepeat', 'no-repeat');
            this.renderer.setStyle(el, 'backgroundSize', 'contain');
        };
        bkgImg.src = bkgImgPath;
    }
    */
    /***********************************************************************************************
     * @fn          onDragEnded
     *
     * @brief
     *
     */
    onDragEnded(event: CdkDragEnd, keyVal: any) {

        this.dragFlag = false;
        event.source.element.nativeElement.style.zIndex = '1';

        const evtPos = event.source.getFreeDragPosition();

        let pos: gIF.nsPos_t = {
            x: evtPos.x / this.imgDim.width,
            y: evtPos.y / this.imgDim.height,
        };
        keyVal.value.pos = pos;

        this.storage.setAttrPos(pos, keyVal);
    }

    /***********************************************************************************************
     * @fn          onDragEnded
     *
     * @brief
     *
     */
    onDragStarted(event: CdkDragStart) {
        this.dragFlag = true;
        event.source.element.nativeElement.style.zIndex = '10000';
    }

    /***********************************************************************************************
     * @fn          setStyles
     *
     * @brief
     *
     */
    setStyles(keyVal: any) {

        this.startWait();
        setTimeout(()=>{
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = keyVal;
            dialogConfig.width = '350px';
            dialogConfig.autoFocus = false;
            dialogConfig.disableClose = true;
            dialogConfig.panelClass = 'set-styles-container';
            dialogConfig.restoreFocus = false;
            //dialogConfig.enterAnimationDuration = '0ms';
            //dialogConfig.exitAnimationDuration = '0ms'

            const dlgRef = this.matDialog.open(SetStyles, dialogConfig);
            dlgRef.afterOpened().subscribe(()=>{
                this.progressFlag = false;
            });
        }, 10);
    }

    /***********************************************************************************************
     * @fn          onEditScrollsClick
     *
     * @brief
     *
     */
    onEditScrollsClick() {

        this.startWait();
        setTimeout(()=>{
            const dlgData = {
                scrolls: JSON.parse(JSON.stringify(this.scrolls)),
                scrollRef: this.floorPlanRef.nativeElement,
                imgDim: this.imgDim,
            };
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = dlgData;
            dialogConfig.width = '250px';
            dialogConfig.autoFocus = false;
            dialogConfig.disableClose = true;
            dialogConfig.panelClass = 'edit-scrolls-container';
            dialogConfig.restoreFocus = false;

            const dlgRef = this.matDialog.open(EditScrolls, dialogConfig);

            dlgRef.afterOpened().subscribe(()=>{
                this.progressFlag = false;
            });
            dlgRef.afterClosed().subscribe((data: gIF.scroll_t[]) => {
                if (data) {
                    this.scrolls = data;
                    this.scrolls.unshift(dumyScroll);
                    this.storage.setScrolls(data);
                }
            });
        }, 10);
    }

    /***********************************************************************************************
     * @fn          setDNS
     *
     * @brief
     *
     */
    setDNS() {

        this.startWait();
        setTimeout(()=>{
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = '';
            dialogConfig.width = '350px';
            dialogConfig.autoFocus = false;
            dialogConfig.disableClose = true;
            dialogConfig.panelClass = 'set-dns-container';
            dialogConfig.restoreFocus = false;

            const dlgRef = this.matDialog.open(EditFreeDNS, dialogConfig);
            dlgRef.afterOpened().subscribe(()=>{
                this.progressFlag = false;
            });
        }, 10);
    }
    /***********************************************************************************************
     * @fn          editBinds
     *
     * @brief
     *
     */
    editBinds() {

        this.startWait();
        setTimeout(()=>{
            const dlgData = {
                partMap: this.partMap,
            };
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = dlgData;
            //dialogConfig.minWidth = '300px';
            dialogConfig.autoFocus = false;
            dialogConfig.disableClose = true;
            dialogConfig.panelClass = 'edit-binds-container';
            dialogConfig.restoreFocus = false;

            const dlgRef = this.matDialog.open(EditBinds, dialogConfig);

            dlgRef.afterOpened().subscribe(()=>{
                this.progressFlag = false;
            });
        }, 10);
    }

    /***********************************************************************************************
     * @fn          editThermostats
     *
     * @brief
     *
     */
    editThermostats() {

        this.startWait();
        setTimeout(()=>{
            const dlgData = {
                partMap: this.partMap,
            };
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = dlgData;
            //dialogConfig.minWidth = '300px';
            dialogConfig.autoFocus = false;
            dialogConfig.disableClose = true;
            dialogConfig.panelClass = 'edit-thermostats-container';
            dialogConfig.restoreFocus = false;

            const dlgRef = this.matDialog.open(EditStats, dialogConfig);

            dlgRef.afterOpened().subscribe(()=>{
                this.progressFlag = false;
            });
        }, 10);
    }

    /***********************************************************************************************
     * @fn          showLogs
     *
     * @brief
     *
     */
    showLogs() {

        this.startWait();
        setTimeout(()=>{
            const dlgData = {
                dummy: 10,
            };
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = dlgData;
            dialogConfig.width = '65%';
            dialogConfig.autoFocus = false;
            dialogConfig.disableClose = true;
            dialogConfig.panelClass = 'show-logs-container';
            dialogConfig.restoreFocus = false;

            const dlgRef = this.matDialog.open(ShowLogs, dialogConfig);
            dlgRef.afterOpened().subscribe(()=>{
                this.progressFlag = false;
            });
        }, 10);
    }

    /***********************************************************************************************
     * fn          showTooltip
     *
     * brief
     *
     */
    showTooltip(tt: MatTooltip, attr: gIF.hostedAttr_t) {

        let ttMsg = '';
        ttMsg += `attr-name: ${attr.name} \n`;
        ttMsg += `S/N: ${this.utils.extToHex(attr.extAddr)} \n`;
        let partDesc: gIF.part_t = this.partMap.get(attr.partNum);
        if(partDesc) {
            ttMsg += `node-name: ${partDesc.devName} \n`;
            ttMsg += `part: ${partDesc.part} \n`;
            ttMsg += `url: ${partDesc.url} \n`;
        }
        tt.message = ttMsg;
        tt.showDelay = 500;
        tt.tooltipClass = 'attr-tooltip';
        tt.show();
    }
    /***********************************************************************************************
     * fn          hideTooltip
     *
     * brief
     *
     *
    hideTooltip(tt: MatTooltip){
        tt.hide();
    }
    */

    /***********************************************************************************************
     * fn          scrollSelChange
     *
     * brief
     *
     */
    scrollSelChange(scroll){

        console.log(scroll);
        if(scroll.value){
            if(scroll.value.name !== DUMMY_SCROLL){
                const x = 0;
                const y = (scroll.value.yPos * this.imgDim.height) / 100;

                this.floorPlanRef.nativeElement.scrollTo({
                    top: y,
                    left: x,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    this.selScroll = this.scrolls[0];
                }, 1000);
            }
        }
    }

    /***********************************************************************************************
     * fn          onResize
     *
     * brief
     *
     */
    onResize(event) {
        const rect = event.contentRect;
        console.log(`w: ${rect.width}, h: ${rect.height}`);

        //this.scaleImgConteiner();
        const el = this.containerRef.nativeElement;

        this.imgDim.width = rect.width;
        this.imgDim.height = Math.round((rect.width / this.bkgImgWidth) * this.bkgImgHeight);
        this.ngZone.run(()=>{
            this.renderer.setStyle(el, 'height', `${this.imgDim.height}px`);
        });
    }

    /***********************************************************************************************
     * fn          tempEvent
     *
     * brief
     *
     */
    tempEvent(event: gIF.tempEvent_t){

        const key = this.storage.thermostatKey(event.extAddr, event.endPoint);
        const nvThermostat: gIF.thermostat_t = this.storage.nvThermostatsMap.get(key);
        if(nvThermostat){
            if(nvThermostat.actuators.length){
                let changed = false;
                if(nvThermostat.setPoint !== nvThermostat.prevSetPoint){
                    changed = true;
                    nvThermostat.prevSetPoint = nvThermostat.setPoint;
                    nvThermostat.workPoint = nvThermostat.setPoint - nvThermostat.hysteresis;
                }
                if(event.temp > nvThermostat.workPoint){
                    if(nvThermostat.workPoint > nvThermostat.setPoint){
                        changed = true;
                        nvThermostat.workPoint = nvThermostat.setPoint - nvThermostat.hysteresis;
                    }
                }
                if(event.temp < nvThermostat.workPoint){
                    if(nvThermostat.workPoint < nvThermostat.setPoint){
                        changed = true;
                        nvThermostat.workPoint = nvThermostat.setPoint + nvThermostat.hysteresis;
                    }
                }
                if(changed){
                    this.storage.storeThermostat(nvThermostat);
                }

                let cmd = 0x00; // OFF
                if(event.temp < nvThermostat.workPoint){
                    cmd = 0x01; // ON
                }
                for(const on_off of nvThermostat.actuators){
                    const zclCmd = {} as gIF.udpZclReq_t;
                    zclCmd.ip = on_off.ip;
                    zclCmd.port = on_off.port;
                    zclCmd.extAddr = on_off.extAddr;
                    zclCmd.endPoint = on_off.endPoint;
                    zclCmd.clusterID = gConst.CLUSTER_ID_GEN_ON_OFF;
                    zclCmd.hasRsp = 0;
                    zclCmd.cmdLen = 3;
                    zclCmd.cmd = [];
                    zclCmd.cmd[0] = 0x11; // cluster spec cmd, not manu spec, client to srv dir, disable dflt rsp
                    zclCmd.cmd[1] = 0x00; // seq num -> not used
                    zclCmd.cmd[2] = cmd;  // ON/OFF command
                    this.serialLink.udpZclCmd(JSON.stringify(zclCmd));
                }
            }
        }
    }

    /***********************************************************************************************
     * fn          startWait
     *
     * brief
     *
     */
    startWait(){
        this.progressFlag = true;
        this.waitMsg = 'wait...';
        /*
        this.msgIdx = 0;
        setTimeout(() => {
            this.incrWait()
        }, 250);
        */
    }

    /***********************************************************************************************
     * fn          incrWait
     *
     * brief
     *
     */
    incrWait(){
        if(this.progressFlag === true){
            let strArr = wait_msg.split('');
            strArr[this.msgIdx] = 'x';
            this.waitMsg = strArr.join('');
            this.msgIdx++;
            if(this.msgIdx === wait_msg.length){
                this.msgIdx = 0;
            }
            setTimeout(() => {
                this.incrWait()
            }, 250);
        }
    }

}
