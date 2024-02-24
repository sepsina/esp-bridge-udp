import { Injectable } from '@angular/core';

//import * as gConst from './gConst';
import * as gIF from '../gIF';
import * as gConst from '../gConst';

@Injectable({
    providedIn: 'root',
})
export class StorageService {

    attrMap = new Map();
    bindsMap = new Map();

    nvAttrMap = new Map();
    nvBindsMap = new Map();

    nvThermostatsMap = new Map();

    constructor() {
        setTimeout(()=>{
            this.init();
        }, 100);
    }

    async init() {
        localStorage.clear();
    }

    /***********************************************************************************************
     * fn          readAllKeys
     *
     * brief
     *
     */
    readAllKeys() {

        for(let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            const val = JSON.parse(localStorage.getItem(key));
            if(key.slice(0, 4) == 'attr') {
                this.nvAttrMap.set(key, val);
            }
            if(key.slice(0, 4) == 'bind') {
                this.nvBindsMap.set(key, val);
            }
            if(key.slice(0, 10) == 'thermostat') {
                this.nvThermostatsMap.set(key, val);
            }
        }
    }

    /***********************************************************************************************
     * fn          setAttrNameAndStyle
     *
     * brief
     *
     */
    setAttrNameAndStyle(name: string,
                        style: gIF.ngStyle_t,
                        valCorr: gIF.valCorr_t,
                        keyVal: any): gIF.storedAttr_t {
        let key: string = keyVal.key;
        let selAttr: gIF.hostedAttr_t = keyVal.value;
        let storedAttr = {} as gIF.storedAttr_t;

        storedAttr.attrName = name;
        storedAttr.pos = selAttr.pos;
        storedAttr.style = style;
        storedAttr.valCorr = valCorr;

        localStorage.setItem(key, JSON.stringify(storedAttr));

        selAttr.name = name;
        selAttr.style = style;
        selAttr.valCorr = valCorr;

        this.nvAttrMap.set(key, storedAttr);

        return storedAttr;
    }

    /***********************************************************************************************
     * fn          setAttrPos
     *
     * brief
     *
     */
    setAttrPos(pos: gIF.nsPos_t, keyVal: any) {

        let key: string = keyVal.key;
        let selAttr: gIF.hostedAttr_t = keyVal.value;
        let storedAttr = {} as gIF.storedAttr_t;

        storedAttr.attrName = selAttr.name;
        storedAttr.pos = pos;
        storedAttr.style = selAttr.style;
        storedAttr.valCorr = selAttr.valCorr;

        localStorage.setItem(key, JSON.stringify(storedAttr));

        selAttr.pos = pos;
    }

    /***********************************************************************************************
     * fn          delStoredAttr
     *
     * brief
     *
     */
    delStoredAttr(attr: gIF.hostedAttr_t) {

        const key = this.attrKey(attr);

        localStorage.removeItem(key);

        this.attrMap.delete(key);
        this.nvAttrMap.delete(key);

        return key;
    }

    /***********************************************************************************************
     * fn          attrKey
     *
     * brief
     *
     */
    attrKey(params: any) {

        const len = 8 + 1 + 2 + 2 + 2;
        let i = 0;
        let ab = new ArrayBuffer(len);
        let dv = new DataView(ab);
        dv.setFloat64(i, params.extAddr, gConst.LE);
        i += 8;
        dv.setUint8(i++, params.endPoint);
        dv.setUint16(i, params.clusterID, gConst.LE);
        i += 2;
        dv.setUint16(i, params.attrSetID, gConst.LE);
        i += 2;
        dv.setUint16(i, params.attrID, gConst.LE);
        i += 2;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = dv.getUint8(i).toString(16);
        }
        return `attr-${key.join('')}`;
        /*
        let key = `attr-${params.shortAddr.toString(16).padStart(4, '0').toUpperCase()}`;
        key += `:${params.endPoint.toString(16).padStart(2, '0').toUpperCase()}`;
        key += `:${params.clusterID.toString(16).padStart(4, '0').toUpperCase()}`;
        key += `:${params.attrSetID.toString(16).padStart(4, '0').toUpperCase()}`;
        key += `:${params.attrID.toString(16).padStart(4, '0').toUpperCase()}`;

        return key;
        */
    }

    /***********************************************************************************************
     * fn          setBindName
     *
     * brief
     *
     */
    setBindName(bind: gIF.hostedBind_t) {

        const key = this.bindKey(bind);
        const val: gIF.hostedBind_t = this.bindsMap.get(key);
        if(val) {
            let storedBind = {} as gIF.storedBind_t;
            storedBind.bindName = bind.name;
            localStorage.setItem(key, JSON.stringify(storedBind));
            val.name = bind.name;
            this.nvBindsMap.set(key, storedBind);
        }
    }

    /***********************************************************************************************
     * fn          delStoredBinds
     *
     * brief
     *
     */
    delStoredBind(binds: gIF.hostedBind_t) {

        const key = this.bindKey(binds);

        localStorage.removeItem(key);

        this.bindsMap.delete(key);
        this.nvBindsMap.delete(key);

        return key;
    }

    /***********************************************************************************************
     * fn          bindsKey
     *
     * brief
     *
     */
    bindKey(bind: gIF.hostedBind_t) {

        const len = 8 + 1 + 2;
        let i = 0;
        let ab = new ArrayBuffer(len);
        let dv = new DataView(ab);
        dv.setFloat64(i, bind.extAddr, gConst.LE);
        i += 8;
        dv.setUint8(i++, bind.srcEP);
        dv.setUint16(i, bind.clusterID, gConst.LE);
        i += 2;
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = dv.getUint8(i).toString(16);
        }
        return `bind-${key.join('')}`;
        /*
        let key = `bind-${bind.srcShortAddr.toString(16).padStart(4, '0').toUpperCase()}`;
        key += `:${bind.srcEP.toString(16).padStart(2, '0').toUpperCase()}`;
        key += `:${bind.clusterID.toString(16).padStart(4, '0').toUpperCase()}`;

        return key;
        */
    }

    /***********************************************************************************************
     * fn          setScrolls
     *
     * brief
     *
     */
    setScrolls(scrolls: gIF.scroll_t[]) {
        localStorage.setItem('scrolls', JSON.stringify(scrolls));
    }
    /***********************************************************************************************
     * fn          getScrolls
     *
     * brief
     *
     */
    getScrolls(): string {
        return localStorage.getItem('scrolls');
    }

    /***********************************************************************************************
     * fn          setPublicIP
     *
     * brief
     *
     */
    setPublicIP(ip: string) {
        localStorage.setItem('public-ip', ip);
    }
    /***********************************************************************************************
     * fn          getPublicIP
     *
     * brief
     *
     */
    getPublicIP(): string {
        return localStorage.getItem('public-ip');
    }

    /***********************************************************************************************
     * fn          setFreeDNS
     *
     * brief
     *
     */
    setFreeDNS(dns: gIF.dns_t) {
        localStorage.setItem('free-dns', JSON.stringify(dns));
    }
    /***********************************************************************************************
     * fn          getFreeDNS
     *
     * brief
     *
     */
    getFreeDNS(): gIF.dns_t {

        const dns = localStorage.getItem('free-dns');

        if(dns) {
            return JSON.parse(dns);
        }

        return null;
    }

    /***********************************************************************************************
     * fn          thermostatKey
     *
     * brief
     *
     */
    thermostatKey(extAddr: number, endPoint: number) {

        const len = 8 + 1;
        let i = 0;
        let ab = new ArrayBuffer(len);
        let dv = new DataView(ab);
        dv.setFloat64(i, extAddr, gConst.LE);
        i += 8;
        dv.setUint8(i++, endPoint);
        let key = [];
        for (let i = 0; i < len; i++) {
            key[i] = dv.getUint8(i).toString(16);
        }
        return `thermostat-${key.join('')}`;

    }

    /***********************************************************************************************
     * fn          delThermostat
     *
     * brief
     *
     */
    delThermostat(thermostat: gIF.thermostat_t) {

        const key = this.thermostatKey(thermostat.extAddr, thermostat.endPoint);
        localStorage.removeItem(key);

        return key;
    }

    /***********************************************************************************************
     * fn          delAllThermostat
     *
     * brief
     *
     */
    delAllThermostat() {

        for(const key of this.nvThermostatsMap.keys()){
            localStorage.removeItem(key);
        }
        this.nvThermostatsMap.clear();
    }

    /***********************************************************************************************
     * fn          storeThermostat
     *
     * brief
     *
     */
    storeThermostat(thermostat: gIF.thermostat_t) {

        const key = this.thermostatKey(thermostat.extAddr, thermostat.endPoint);
        localStorage.setItem(key, JSON.stringify(thermostat));

        this.nvThermostatsMap.set(key, thermostat);

    }

}
