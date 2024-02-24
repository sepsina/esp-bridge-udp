import { Injectable, NgZone } from '@angular/core';
import { EventsService } from './events.service';
import * as gIF from '../gIF';

@Injectable({
    providedIn: 'root',
})
export class UtilsService {

    msgLogs: gIF.msgLogs_t[] = [];

    constructor(private events: EventsService,
                private ngZone: NgZone) {
        // ---
    }

    public byteArrToInt16(arr: number[]): number {
        let val = 0x0000;
        val = arr[1];
        val <<= 8;
        val |= arr[0];
        return val;
    }

    public byteArrToInt32(arr: number[]): number {
        let val = 0x00000000;
        val = arr[3];
        val <<= 8;
        val |= arr[2];
        val <<= 8;
        val |= arr[1];
        val <<= 8;
        val |= arr[0];
        return val;
    }

    public int32ToByteArr(int32: number): number[] {
        let arr = [];
        arr[0] = (int32 & 0x000000ff) >> 0;
        arr[1] = (int32 & 0x0000ff00) >> 8;
        arr[2] = (int32 & 0x00ff0000) >> 16;
        arr[3] = (int32 & 0xff000000) >>> 24;
        return arr;
    }

    public int16ToByteArr(int16: number): number[] {
        let arr = [];
        arr[0] = (int16 & 0x00ff) >> 0;
        arr[1] = (int16 & 0xff00) >>> 8;
        return arr;
    }

    public dateFromByteArray(byteArr: number[]): Date {
        let zbDate = new Date();
        let zbTime = this.byteArrToInt32(byteArr);
        let mSec = zbTime * 1000 + Date.UTC(2000, 0, 1);
        zbDate.setTime(mSec);
        return zbDate;
    }

    public dateToByteArray(newDate: Date) {
        let secFrom1970: number = newDate.getTime() / 1000;
        let secFrom2000: number = Date.UTC(2000, 0, 1) / 1000;
        let zbTime: number = secFrom1970 - secFrom2000;
        return this.int32ToByteArr(zbTime);
    }

    public timeStamp() {
        const now = new Date();
        const hours = now.getHours().toString(10).padStart(2, '0');
        const minutes = now.getMinutes().toString(10).padStart(2, '0');
        const seconds = now.getSeconds().toString(10).padStart(2, '0');
        return `<${hours}:${minutes}:${seconds}>`;
    }

    public strToByteArr(str: string): number[] {
        let len = str.length;
        let strVal = str;
        let arr = [];
        arr[0] = len;
        for (let i = 0; i < len; i++) {
            arr.push(strVal.charCodeAt(i));
        }
        return arr;
    }

    public byteArrToStr(arr: number[]): string {
        let len = arr[0];
        let charArr = arr.slice(1, len + 1);
        return String.fromCharCode.apply(String, charArr);
    }

    public ipFromLong(ipLong: number): string {
        return (ipLong >>> 24) + '.' + ((ipLong >> 16) & 0xff) + '.' + ((ipLong >> 8) & 0xff) + '.' + (ipLong & 0xff);
    }

    public ipToLong(ip: string): number {
        let ipl = 0;
        ip.split('.').forEach(function (octet) {
            ipl <<= 8;
            ipl += parseInt(octet);
        });
        return ipl >>> 0;
    }

    public arrayBufToBuf(arrayBuf: ArrayBuffer) {
        let buf = window.nw.Buffer.alloc(arrayBuf.byteLength);
        let view = new Uint8Array(arrayBuf);
        for (let i = 0; i < buf.length; i++) {
            buf[i] = view[i];
        }
        return buf;
    }

    public bufToArrayBuf(buf: any) {
        let arrayBuf = new ArrayBuffer(buf.length);
        let view = new Uint8Array(arrayBuf);
        for (let i = 0; i < buf.length; i++) {
            view[i] = buf[i];
        }
        return arrayBuf;
    }

    public arrToArrayBuf(arr: number[]) {
        let arrayBuf = new ArrayBuffer(arr.length);
        let view = new Uint8Array(arrayBuf);
        for (let i = 0; i < arr.length; i++) {
            view[i] = arr[i];
        }
        return arrayBuf;
    }

    public extToHex(extAddr: number) {
        let ab = new ArrayBuffer(8);
        let dv = new DataView(ab);
        dv.setFloat64(0, extAddr);
        let extHex = [];
        for (let i = 0; i < 8; i++) {
            extHex[i] = ('0' + dv.getUint8(i).toString(16)).slice(-2);
        }
        return extHex.join(':');
    }

    public sendMsg(msg: string, color: string = 'black', id: number = 1000){
        const log = `${this.timeStamp()} ${msg}`;
        console.log(log);
        const msgLog: gIF.msgLogs_t = {
            text: log,
            color: color,
            id: id
        };
        const last = this.msgLogs.slice(-1)[0];
        if(this.msgLogs.length && (last.id === id) && (id === 7)){
            this.ngZone.run(()=>{
                this.msgLogs[this.msgLogs.length - 1] = msgLog;
            });
        }
        else {
            while(this.msgLogs.length >= 20) {
                this.msgLogs.shift();
            }
            this.ngZone.run(()=>{
                this.msgLogs.push(msgLog);
            });
        }
        this.events.publish('logMsg', msgLog);
    }
}
