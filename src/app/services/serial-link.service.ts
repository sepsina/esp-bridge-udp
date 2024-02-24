import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { StorageService } from './storage.service';
import { PortService } from './port.service';
import { EventsService } from './events.service';
import { UtilsService } from './utils.service';
import * as gConst from '../gConst';
import * as gIF from '../gIF';

@Injectable({
    providedIn: 'root',
})
export class SerialLinkService implements OnDestroy {

    //delTest: number;

    setMap = new Map();

    constructor(private events: EventsService,
                private port: PortService,
                private storage: StorageService,
                private utils: UtilsService,
                private ngZone: NgZone) {
        setTimeout(()=>{
            this.initApp();
        }, 100);
    }

    /***********************************************************************************************
     * fn          initApp
     *
     * brief
     *
     */
    initApp() {

        this.storage.readAllKeys();

        this.events.subscribe('attr_set', (attrSet)=>{
            this.ngZone.run(()=>{
                this.parseAttrSet(JSON.parse(attrSet));
            });
        });
        this.events.subscribe('cluster_bind', (bind)=>{
            this.addBind(JSON.parse(bind));
        });

        //this.port.listComPorts();

        setTimeout(()=>{
            this.cleanAgedAttribs();
        }, 60000);
        setTimeout(()=>{
            this.cleanAgedBinds();
        }, 60000);
        setTimeout(()=>{
            this.cleanAgedSets();
        }, 60000);
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
     * fn          closeSocket
     *
     * brief
     *
     */
    closeSocket() {
        this.port.closeSocket();
    }

    /***********************************************************************************************
     * fn          parseAttrSet
     *
     * brief
     *
     */
    private parseAttrSet(attrSet: gIF.attrSet_t) {

        const now = Math.round(Date.now() / 1000);
        const attrSpec = this.getAttrSpec(attrSet);
        for(let i = 0; i < attrSpec.length; i++) {
            const spec = attrSpec[i];
            if(spec.isVisible == true) {
                const newVal = {} as gIF.hostedAttr_t;
                newVal.extAddr = attrSet.extAddr;
                newVal.endPoint = attrSet.endPoint;
                newVal.clusterID = attrSet.clusterID;
                newVal.attrSetID = attrSet.attrSetID;
                newVal.attrID = spec.attrID;
                const key = this.storage.attrKey(newVal);
                const currVal: gIF.hostedAttr_t = this.storage.attrMap.get(key);
                if(currVal) {
                    currVal.timestamp = spec.timestamp;
                    currVal.ip = attrSet.ip;
                    currVal.port = attrSet.port;
                    currVal.hostShortAddr = attrSet.hostShortAddr;
                    currVal.partNum = attrSet.partNum;
                    currVal.clusterServer = attrSet.clusterServer;
                    currVal.shortAddr = attrSet.shortAddr;
                    currVal.isValid = true;
                    currVal.formatedVal = spec.formatedVal;
                    if(spec.hasHistory) {
                        this.dataHistory(spec.timestamp,
                                         spec.attrVal,
                                         currVal);
                    }
                } else {
                    newVal.drag = false;
                    newVal.isSel = false;
                    newVal.timestamp = now;
                    const storedAttr = this.storage.nvAttrMap.get(key);
                    if(storedAttr) {
                        newVal.pos = storedAttr.pos;
                        newVal.name = storedAttr.attrName;
                        newVal.style = storedAttr.style;
                        newVal.valCorr = storedAttr.valCorr;
                    }
                    else {
                        newVal.pos = {x: 0, y: 0};
                        newVal.name = 'no name';
                        newVal.style = gConst.NG_STYLE;
                        newVal.valCorr = {units: gConst.DEG_C,
                                          slope: 1,
                                          offset: 0};
                    }
                    newVal.ip = attrSet.ip;
                    newVal.port = attrSet.port;
                    newVal.hostShortAddr = attrSet.hostShortAddr;
                    newVal.partNum = attrSet.partNum;
                    newVal.clusterServer = attrSet.clusterServer;
                    newVal.shortAddr = attrSet.shortAddr;
                    newVal.isValid = true;
                    newVal.isSensor = spec.isSensor;
                    newVal.formatedVal = spec.formatedVal;
                    newVal.timestamps = [];
                    newVal.attrVals = [];
                    if(spec.hasHistory) {
                        this.dataHistory(now,
                                         spec.attrVal,
                                         newVal);
                    }
                    this.storage.attrMap.set(key, newVal);
                }
                console.log(spec.formatedVal);
            }
        }
    }

    /***********************************************************************************************
     * fn          cleanAgedAttribs
     *
     * brief
     *
     */
    private cleanAgedAttribs() {

        let diff: number;
        let now = Math.round(Date.now() / 1000);
        for(let [key, val] of this.storage.attrMap) {
            diff = now - val.timestamp;
            if(diff > gConst.ATTR_TTL) {
                this.storage.attrMap.delete(key);
            }
            if(diff > gConst.ATTR_VALID_TTL) {
                val.isValid = false;
            }
        }
        setTimeout(()=>{
            this.cleanAgedAttribs();
        }, 60000); // 60 seconds
    }

    /***********************************************************************************************
     * fn          addSrcBinds
     *
     * brief
     *
     */
    private addBind(bind: gIF.clusterBind_t) {

        const now = Math.round(Date.now() / 1000);
        const newVal = {} as gIF.hostedBind_t;
        newVal.extAddr = bind.extAddr;
        newVal.srcEP = bind.srcEP;
        newVal.clusterID = bind.clusterID;
        const key = this.storage.bindKey(newVal);
        const currVal = this.storage.bindsMap.get(key);
        if(currVal) {
            currVal.timestamp = now;
            currVal.ip = bind.ip;
            currVal.port = bind.port;
            currVal.partNum = bind.partNum;
            currVal.hostShortAddr = bind.hostShortAddr;
            currVal.srcShortAddr = bind.srcShortAddr;
            currVal.dstExtAddr = bind.dstExtAddr;
            currVal.dstEP = bind.dstEP;
        }
        else {
            newVal.timestamp = now;
            const storedBind = this.storage.nvBindsMap.get(key);
            if(storedBind) {
                newVal.name = storedBind.bindName;
            }
            else {
                newVal.name = 'no name';
            }
            newVal.ip = bind.ip;
            newVal.port = bind.port;
            newVal.partNum = bind.partNum;
            newVal.hostShortAddr = bind.hostShortAddr;
            newVal.srcShortAddr = bind.srcShortAddr;
            newVal.dstEP = bind.dstEP;
            newVal.dstExtAddr = bind.dstExtAddr;
            this.storage.bindsMap.set(key, newVal);
        }
        let msg = '';
        msg += `rx bind -> hostShortAddr: 0x${bind.hostShortAddr.toString(16).padStart(4, '0').toUpperCase()},`;
        msg += ` srcAddr: 0x${bind.srcShortAddr.toString(16).padStart(4, '0').toUpperCase()},`;
        msg += ` srcEP: ${bind.srcEP},`;
        msg += ` cluster: 0x${bind.clusterID.toString(16).padStart(4, '0').toUpperCase()},`;
        msg += ` dstExtAddr: ${this.utils.extToHex(bind.dstExtAddr)},`;
        msg += ` dstEP: ${bind.dstEP}`;
        console.log(msg);
    }

    /***********************************************************************************************
     * fn          cleanAgedBinds
     *
     * brief
     *
     */
    private cleanAgedBinds() {

        const now = Math.round(Date.now() / 1000);
        for(let [key, val] of this.storage.bindsMap) {
            const diff = now - val.timestamp;
            if(diff > gConst.BIND_TTL) {
                this.storage.bindsMap.delete(key);
            }
        }
        setTimeout(()=>{
            this.cleanAgedBinds();
        }, 60000);
    }

    /***********************************************************************************************
     * fn          wrBinds
     *
     * brief
     *
     */
    public wrBind(bind: string) {
        this.events.publish('wr_bind', bind);
    }

    /***********************************************************************************************
     * fn          udpZclCmd
     *
     * brief
     *
     */
    public udpZclCmd(zclCmd: string) {
        this.events.publish('zcl_cmd', zclCmd);
    }

    /***********************************************************************************************
     * fn          getKey
     *
     * brief
     *
     */
    private getKey(attrSet: gIF.attrSet_t, attrID: number) {

        const tmp = {
            extAddr: attrSet.extAddr,
            endPoint: attrSet.endPoint,
            clusterID: attrSet.clusterID,
            attrSetID: attrSet.attrSetID,
            attrID: attrID,
        };

        return this.storage.attrKey(tmp);
    }

    /***********************************************************************************************
     * fn          corrVal
     *
     * brief
     *
     */
    private corrVal(val: number, corr: gIF.valCorr_t) {
        switch(corr.units) {
            case gConst.DEG_F: {
                val = (val * 9.0) / 5.0 + 32.0;
                break;
            }
            case gConst.IN_HG: {
                val = val / 33.864;
                break;
            }
        }
        val *= corr.slope;
        val += corr.offset;

        return val;
    }

    /***********************************************************************************************
     * fn          dataHistory
     *
     * brief
     *
     */
    private dataHistory(timestamp: number,
                        val: number,
                        attr: gIF.hostedAttr_t) {
        let len = attr.timestamps.length;
        if(len > 0) {
            const lastTime = attr.timestamps[len - 1];
            if(timestamp - lastTime > 60) {
                attr.timestamps.push(timestamp);
                attr.attrVals.push(val);
                len++;
                if(len > 10) {
                    attr.timestamps.shift();
                    attr.attrVals.shift();
                }
            }
        }
        else {
            attr.timestamps.push(timestamp);
            attr.attrVals.push(val);
        }
    }

    /***********************************************************************************************
     * fn          getAttrSpec
     *
     * brief
     *
     */
    private getAttrSpec(attrSet: gIF.attrSet_t): gIF.attrSpec_t[] {

        let attrSpecs: gIF.attrSpec_t[] = [];
        let valsBuff = new ArrayBuffer(64);
        let valsData = new Uint8Array(valsBuff);
        for(let i = 0; i < attrSet.valsLen; i++) {
            valsData[i] = attrSet.attrVals[i];
        }
        let valsView = new DataView(valsBuff);
        let now = Math.round(Date.now() / 1000);
        let setVals = {} as any;
        let key: string;
        let nvAttr: gIF.storedAttr_t;
        let spec: gIF.attrSpec_t;
        let formatedVal = '';
        let attrID: number;
        let attrName = '';
        let units: number;
        let idx: number;

        switch(attrSet.partNum) {
            case gConst.HTU21D_005_T: {
                idx = 0;
                let temp = valsView.getInt16(idx, gConst.LE);
                idx += 2;
                temp /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                units = gConst.DEG_C;
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    units = nvAttr.valCorr.units;
                    temp = this.corrVal(temp, nvAttr.valCorr);
                    if(units == gConst.DEG_F) {
                        formatedVal = `${temp.toFixed(1)} °F`;
                    }
                    else {
                        formatedVal = `${temp.toFixed(1)} °C`;
                    }
                }
                else {
                    formatedVal = `${temp.toFixed(1)} °C`;
                }
                setVals = {
                    name: attrName,
                    units: units,
                    t_val: temp,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: formatedVal,
                    timestamp: now,
                    attrVal: temp,
                };
                attrSpecs.push(spec);

                const tempEvent = {} as gIF.tempEvent_t;
                tempEvent.temp = temp;
                tempEvent.extAddr = attrSet.extAddr;
                tempEvent.endPoint = attrSet.endPoint;

                this.events.publish('temp_event', tempEvent);
                break;
            }
            case gConst.HTU21D_005_RH: {
                idx = 0;
                let rh = valsView.getUint16(idx, gConst.LE);
                idx += 2;
                rh /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    rh = this.corrVal(rh, nvAttr.valCorr);
                }
                setVals = {
                    name: attrName,
                    rh_val: rh,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: `${rh.toFixed(0)} %rh`,
                    timestamp: now,
                    attrVal: rh,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.HTU21D_005_BAT: {
                idx = 0;
                let batVolt = valsView.getUint8(idx++);
                batVolt /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    bat_volt: batVolt,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: false,
                    formatedVal: `${batVolt.toFixed(1)} V`,
                    timestamp: now,
                    attrVal: batVolt,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.SH_006_SH: {
                idx = 0;
                let sh = valsView.getUint16(idx, gConst.LE);
                idx += 2;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    sh_val: sh,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: `${sh.toFixed(0)} %sh`,
                    timestamp: now,
                    attrVal: sh,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.SH_006_BAT: {
                idx = 0;
                let batVolt = valsView.getUint8(idx++);
                batVolt /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    bat_volt: batVolt,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: false,
                    formatedVal: `${batVolt.toFixed(1)} V`,
                    timestamp: now,
                    attrVal: batVolt,
                };
                attrSpecs.push(spec);
                break;
            }

            case gConst.BME280_007_T: {
                idx = 0;
                let temp = valsView.getInt16(idx, gConst.LE);
                idx += 2;
                temp /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                units = gConst.DEG_C;
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    units = nvAttr.valCorr.units;
                    temp = this.corrVal(temp, nvAttr.valCorr);
                    if(units == gConst.DEG_F) {
                        formatedVal = `${temp.toFixed(1)} °F`;
                    }
                    else {
                        formatedVal = `${temp.toFixed(1)} °C`;
                    }
                }
                else {
                    formatedVal = `${temp.toFixed(1)} °C`;
                }
                setVals = {
                    name: attrName,
                    units: units,
                    t_val: temp,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: formatedVal,
                    timestamp: now,
                    attrVal: temp,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.BME280_007_RH: {
                idx = 0;
                let rh = valsView.getUint16(idx, gConst.LE);
                idx += 2;
                rh /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    rh = this.corrVal(rh, nvAttr.valCorr);
                }
                setVals = {
                    name: attrName,
                    rh_val: rh,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: `${rh.toFixed(0)} %rh`,
                    timestamp: now,
                    attrVal: rh,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.BME280_007_P: {
                idx = 0;
                let press = valsView.getInt16(idx, gConst.LE);
                idx += 2;
                press /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                units = gConst.M_BAR;
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                    units = nvAttr.valCorr.units;
                    press = this.corrVal(press, nvAttr.valCorr);
                    if(units == gConst.IN_HG) {
                        formatedVal = `${press.toFixed(1)} mmHg`;
                    }
                    else {
                        formatedVal = `${press.toFixed(1)} mBar`;
                    }
                }
                else {
                    formatedVal = `${press.toFixed(1)} mBar`;
                }
                setVals = {
                    name: attrName,
                    units: units,
                    p_val: press,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: true,
                    hasHistory: true,
                    formatedVal: formatedVal,
                    timestamp: now,
                    attrVal: press,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.BME280_007_BAT: {
                idx = 0;
                let batVolt = valsView.getUint8(idx++);
                batVolt /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    bat_volt: batVolt,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: false,
                    formatedVal: `${batVolt.toFixed(1)} V`,
                    timestamp: now,
                    attrVal: batVolt,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.SSR_009_RELAY: {
                idx = 0;
                let state = valsView.getUint8(idx++);
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    state: state,
                    level: 0xff,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: true,
                    formatedVal: !!state ? 'on' : 'off',
                    timestamp: now,
                    attrVal: state,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.ACUATOR_010_ON_OFF: {
                idx = 0;
                let state = valsView.getUint8(idx++);
                let level = valsView.getUint8(idx++);
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                formatedVal = 'off';
                if(!!state) {
                    formatedVal = `on (${level}%)`;
                }
                setVals = {
                    name: attrName,
                    state: state,
                    level: level,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: true,
                    formatedVal: formatedVal,
                    timestamp: now,
                    attrVal: state,
                };
                attrSpecs.push(spec);
                break;
            }
            case gConst.DBL_SW_008_BAT: {
                idx = 0;
                let batVolt = valsView.getUint8(idx++);
                batVolt /= 10.0;
                attrID = 0;
                key = this.getKey(attrSet, attrID);
                nvAttr = this.storage.nvAttrMap.get(key);
                attrName = '';
                if(nvAttr) {
                    attrName = nvAttr.attrName;
                }
                setVals = {
                    name: attrName,
                    bat_volt: batVolt,
                };
                spec = {
                    attrID: attrID,
                    isVisible: true,
                    isSensor: false,
                    hasHistory: false,
                    formatedVal: `${batVolt.toFixed(1)} V`,
                    timestamp: now,
                    attrVal: batVolt,
                };
                attrSpecs.push(spec);
                break;
            }
        }
        let hostedSet = {
            timestamp: now,
            ip: attrSet.ip,
            port: attrSet.port,
            hostShortAddr: attrSet.hostShortAddr,
            partNum: attrSet.partNum,
            extAddr: attrSet.extAddr,
            shortAddr: attrSet.shortAddr,
            endPoint: attrSet.endPoint,
            clusterID: attrSet.clusterID,
            attrSetID: attrSet.attrSetID,
            setVals: setVals,
        };
        key = this.attrSetKey(hostedSet);
        this.setMap.set(key, hostedSet);

        return attrSpecs;
    }

    /***********************************************************************************************
     * fn          attrSetKey
     *
     * brief
     *
     */
    attrSetKey(params: any) {

        const len = 8 + 1 + 2 + 2;
        const ab = new ArrayBuffer(len);
        const dv = new DataView(ab);
        let i = 0;
        dv.setFloat64(i, params.extAddr, gConst.LE);
        i += 8;
        dv.setUint8(i++, params.endPoint);
        dv.setUint16(i, params.clusterID, gConst.LE);
        i += 2;
        dv.setUint16(i, params.attrSetID, gConst.LE);
        i += 2;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = dv.getUint8(i).toString(16);
        }
        return `set-${key.join('')}`;
        /*
        let key = `set-${params.shortAddr.toString(16).padStart(4, '0').toUpperCase()}`;
        key += `:${params.endPoint.toString(16).padStart(2, '0').toUpperCase()}`;
        key += `:${params.clusterID.toString(16).padStart(4, '0').toUpperCase()}`;
        key += `:${params.attrSetID.toString(16).padStart(4, '0').toUpperCase()}`;

        return key;
        */
    }

    /***********************************************************************************************
     * fn          cleanAgedSets
     *
     * brief
     *
     */
    private cleanAgedSets() {
        let diff: number;
        let now = Math.round(Date.now() / 1000);
        for(let [key, val] of this.setMap) {
            diff = now - val.timestamp;
            if(diff > gConst.SET_TTL) {
                this.setMap.delete(key);
            }
        }
        setTimeout(()=>{
            this.cleanAgedSets();
        }, 60000); // 60 seconds
    }
}
