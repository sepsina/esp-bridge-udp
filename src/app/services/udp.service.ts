import { Injectable } from '@angular/core';
import { SerialLinkService } from './serial-link.service';
import { UtilsService } from './utils.service';

import * as gConst from '../gConst';
import * as gIF from '../gIF';

const UDP_PORT = 22802;
const ANNCE_TMO = 3000;

@Injectable({
    providedIn: 'root',
})
export class UdpService {

    private nwk;
    private dgram;
    udpSocket;

    msgBuf = new ArrayBuffer(1024);
    msg = new DataView(this.msgBuf);

    constructor(private serial: SerialLinkService,
                private utils: UtilsService) {
        this.nwk = window.nw.require('network');
        this.dgram = window.nw.require('dgram');
        this.udpSocket = this.dgram.createSocket('udp4');
        this.udpSocket.on('message', (msg, rinfo)=>{
            this.udpOnMsg(msg, rinfo);
        });
        this.udpSocket.on('error', (err)=>{
            console.log(`server error:\n${err.stack}`);
        });
        this.udpSocket.on('listening', ()=>{
            let address = this.udpSocket.address();
            console.log(`server listening ${address.address}:${address.port}`);
        });
        this.udpSocket.bind(UDP_PORT, ()=>{
            this.udpSocket.setBroadcast(true);
        });

        setTimeout(()=>{
            this.bridgeAnnce();
        }, ANNCE_TMO);
    }

    /***********************************************************************************************
     * fn          closeSocket
     *
     * brief
     *
     */
    public closeSocket() {
        this.udpSocket.close();
    }

    /***********************************************************************************************
     * fn          udpOnMsg
     *
     * brief
     *
     */
    public udpOnMsg(msg, rem) {

        let msgBuf = this.utils.bufToArrayBuf(msg);
        let cmdView = new DataView(msgBuf);
        let msgIdx = 0;
        let cmdIdx = 0;

        let pktFunc = cmdView.getUint16(cmdIdx, gConst.LE);
        cmdIdx += 2;
        switch(pktFunc) {
            case gConst.BRIDGE_ID_REQ: {
                let rnd = Math.floor(Math.random() * 100) + 50;
                setTimeout(()=>{
                    this.msg.setUint16(0, gConst.BRIDGE_ID_RSP, gConst.LE);
                    let bufData = this.utils.arrayBufToBuf(this.msgBuf.slice(0, 2));
                    this.udpSocket.send(bufData, 0, 2, rem.port, rem.address, (err)=>{
                        if(err) {
                            console.log('UDP ERR: ' + JSON.stringify(err));
                        }
                    });
                }, rnd);
                break;
            }
            case gConst.ON_OFF_ACTUATORS: {
                this.msg.setUint16(msgIdx, pktFunc, gConst.LE);
                msgIdx += 2;
                let startIdx = cmdView.getUint16(cmdIdx, gConst.LE);
                cmdIdx += 2;
                this.msg.setUint16(msgIdx, startIdx, gConst.LE);
                msgIdx += 2;
                let numIdx = msgIdx;
                let numVals = 0;
                this.msg.setUint16(msgIdx, numVals, gConst.LE);
                msgIdx += 2;
                let doneIdx = msgIdx;
                this.msg.setUint8(msgIdx, 1);
                msgIdx++;
                let valIdx = 0;
                for(let attrSet of this.serial.setMap.values()) {
                    if(attrSet.clusterID == gConst.CLUSTER_ID_GEN_ON_OFF) {
                        if(valIdx >= startIdx) {
                            numVals++;
                            this.msg.setUint32(msgIdx, attrSet.partNum, gConst.LE);
                            msgIdx += 4;
                            this.msg.setFloat64(msgIdx, attrSet.extAddr, gConst.LE);
                            msgIdx += 8;
                            this.msg.setUint8(msgIdx, attrSet.endPoint);
                            msgIdx++;
                            this.msg.setUint8(msgIdx, attrSet.setVals.state);
                            msgIdx++;
                            this.msg.setUint8(msgIdx, attrSet.setVals.level);
                            msgIdx++;
                            this.msg.setUint8(msgIdx, attrSet.setVals.name.length);
                            msgIdx++;
                            for(let i = 0; i < attrSet.setVals.name.length; i++) {
                                this.msg.setUint8(msgIdx, attrSet.setVals.name.charCodeAt(i));
                                msgIdx++;
                            }
                            this.msg.setUint32(msgIdx, this.utils.ipToLong(attrSet.ip), gConst.LE);
                            msgIdx += 4;
                            this.msg.setUint16(msgIdx, attrSet.port, gConst.LE);
                            msgIdx += 2;
                        }
                        valIdx++;
                    }
                    if(msgIdx > 500) {
                        this.msg.setUint8(doneIdx, 0);
                        break; // exit for-loop
                    }
                }
                if(numVals) {
                    this.msg.setUint16(numIdx, numVals, gConst.LE);
                }
                const len = msgIdx;
                let bufData = this.utils.arrayBufToBuf(this.msgBuf.slice(0, len));
                this.udpSocket.send(bufData, 0, len, rem.port, rem.address, (err)=>{
                    if(err) {
                        console.log('UDP ERR: ' + JSON.stringify(err));
                    }
                });
                break;
            }
            case gConst.T_SENSORS: {
                this.msg.setUint16(msgIdx, pktFunc, gConst.LE);
                msgIdx += 2;
                let startIdx = cmdView.getUint16(cmdIdx, gConst.LE);
                cmdIdx += 2;
                this.msg.setUint16(msgIdx, startIdx, gConst.LE);
                msgIdx += 2;
                let numIdx = msgIdx;
                let numVals = 0;
                this.msg.setUint16(msgIdx, numVals, gConst.LE);
                msgIdx += 2;
                let doneIdx = msgIdx;
                this.msg.setUint8(msgIdx, 1);
                msgIdx++;
                let valIdx = 0;
                for(let attrSet of this.serial.setMap.values()) {
                    if(attrSet.clusterID == gConst.CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT) {
                        if(valIdx >= startIdx) {
                            numVals++;
                            this.msg.setUint32(msgIdx, attrSet.partNum, gConst.LE);
                            msgIdx += 4;
                            this.msg.setFloat64(msgIdx, attrSet.extAddr, gConst.LE);
                            msgIdx += 8;
                            this.msg.setUint8(msgIdx, attrSet.endPoint);
                            msgIdx++;
                            this.msg.setInt16(msgIdx, 10 * attrSet.setVals.t_val, gConst.LE);
                            msgIdx += 2;
                            this.msg.setUint16(msgIdx, attrSet.setVals.units, gConst.LE);
                            msgIdx += 2;
                            this.msg.setUint8(msgIdx, attrSet.setVals.name.length);
                            msgIdx++;
                            for(let i = 0; i < attrSet.setVals.name.length; i++) {
                                this.msg.setUint8(msgIdx, attrSet.setVals.name.charCodeAt(i));
                                msgIdx++;
                            }
                        }
                        valIdx++;
                    }
                    if(msgIdx > 500) {
                        this.msg.setUint8(doneIdx, 0);
                        break; // exit for-loop
                    }
                }
                if(numVals) {
                    this.msg.setUint16(numIdx, numVals, gConst.LE);
                }
                const len = msgIdx;
                let bufData = this.utils.arrayBufToBuf(this.msgBuf.slice(0, len));
                this.udpSocket.send(bufData, 0, len, rem.port, rem.address, (err)=>{
                    if(err) {
                        console.log('UDP ERR: ' + JSON.stringify(err));
                    }
                });
                break;
            }
            case gConst.RH_SENSORS: {
                this.msg.setUint16(msgIdx, pktFunc, gConst.LE);
                msgIdx += 2;
                let startIdx = cmdView.getUint16(cmdIdx, gConst.LE);
                cmdIdx += 2;
                this.msg.setUint16(msgIdx, startIdx, gConst.LE);
                msgIdx += 2;
                let numIdx = msgIdx;
                let numVals = 0;
                this.msg.setUint16(msgIdx, numVals, gConst.LE);
                msgIdx += 2;
                let doneIdx = msgIdx;
                this.msg.setUint8(msgIdx, 1);
                msgIdx++;
                let valIdx = 0;
                for(let attrSet of this.serial.setMap.values()) {
                    if(attrSet.clusterID == gConst.CLUSTER_ID_MS_RH_MEASUREMENT) {
                        if(valIdx >= startIdx) {
                            numVals++;
                            this.msg.setUint32(msgIdx, attrSet.partNum, gConst.LE);
                            msgIdx += 4;
                            this.msg.setFloat64(msgIdx, attrSet.extAddr, gConst.LE);
                            msgIdx += 8;
                            this.msg.setUint8(msgIdx, attrSet.endPoint);
                            msgIdx++;
                            this.msg.setUint16(msgIdx, 10 * attrSet.setVals.rh_val, gConst.LE);
                            msgIdx += 2;
                            this.msg.setUint8(msgIdx, attrSet.setVals.name.length);
                            msgIdx++;
                            for(let i = 0; i < attrSet.setVals.name.length; i++) {
                                this.msg.setUint8(msgIdx, attrSet.setVals.name.charCodeAt(i));
                                msgIdx++;
                            }
                        }
                        valIdx++;
                    }
                    if(msgIdx > 500) {
                        this.msg.setUint8(doneIdx, 0);
                        break; // exit for-loop
                    }
                }
                if(numVals) {
                    this.msg.setUint16(numIdx, numVals, gConst.LE);
                }
                const len = msgIdx;
                let bufData = this.utils.arrayBufToBuf(this.msgBuf.slice(0, len));
                this.udpSocket.send(bufData, 0, len, rem.port, rem.address, (err)=>{
                    if(err) {
                        console.log('UDP ERR: ' + JSON.stringify(err));
                    }
                });
                break;
            }
            default:
                // ---
                break;
        }
    }

    /***********************************************************************************************
     * fn          bridgeAnnce
     *
     * brief
     *
     */
    bridgeAnnce() {
        this.nwk.get_gateway_ip((err, ip)=>{
            if(!err){
                const bcastIP  = ip.split('.');
                bcastIP[3] = '255';
                const ipStr = bcastIP.join('.');
                this.msg.setUint16(0, gConst.BRIDGE_ID_RSP, gConst.LE);
                let bufData = this.utils.arrayBufToBuf(this.msgBuf.slice(0, 2));
                this.udpSocket.send(bufData, 0, 2, UDP_PORT, ipStr, (err)=>{
                    if(err) {
                        console.log('UDP ERR: ' + JSON.stringify(err));
                    }
                });
            }
        })
        setTimeout(()=>{
            this.bridgeAnnce();
        }, ANNCE_TMO);
    }
}
