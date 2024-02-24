///<reference types="chrome"/>
import {Injectable} from '@angular/core';
import {EventsService} from './events.service';
import {UtilsService} from './utils.service';
import * as gConst from '../gConst';
import * as gIF from '../gIF';

const UDP_PORT = 18870;

@Injectable({
    providedIn: 'root',
})
export class PortService {

    private udpCmdQueue: gIF.udpCmd_t[] = [];
    private udpCmdFlag = false;
    private udpCmdTmoRef;
    private runTmoRef = null;

    private dgram: any;
    udpSocket: any;

    private seqNum = 0;
    udpCmd = {} as gIF.udpCmd_t;

    private msgBuf = new ArrayBuffer(256);
    private msg: DataView = new DataView(this.msgBuf);

    constructor(private events: EventsService,
                private utils: UtilsService) {
        this.events.subscribe('wr_bind', (bind)=>{
            this.wrBind(bind);
        });
        this.events.subscribe('zcl_cmd', (cmd)=>{
            this.udpZclCmd(cmd);
        });

        this.dgram = window.nw.require('dgram');
        this.udpSocket = this.dgram.createSocket('udp4');
        this.udpSocket.on('message', (msg, rinfo)=>{
            this.processMsg(msg, rinfo);
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
     * fn          processMsg
     *
     * brief
     *
     */
    private processMsg(msg, rem) {

        //let msgBuf = this.utils.bufToArrayBuf(msg);
        let msgBuf = msg.buffer;
        let msgView = new DataView(msgBuf);
        let idx = 0;

        let cmdID = msgView.getUint16(idx, gConst.LE);
        idx += 2;
        switch(cmdID) {
            case gConst.SL_MSG_HOST_ANNCE: {
                let dataHost = {} as gIF.dataHost_t;
                dataHost.shortAddr = msgView.getUint16(idx, gConst.LE);
                idx += 2;
                dataHost.extAddr = msgView.getFloat64(idx, gConst.LE);
                idx += 8;
                dataHost.numAttrSets = msgView.getInt8(idx++);
                dataHost.numSrcBinds = msgView.getInt8(idx++);
                let ttl = msgView.getUint16(idx, gConst.LE);

                //let log = this.utils.timeStamp();
                let log = 'host ->';
                log += ` short: 0x${dataHost.shortAddr.toString(16).padStart(4, '0').toUpperCase()},`;
                log += ` ext: ${this.utils.extToHex(dataHost.extAddr)},`;
                log += ` numAttr: ${dataHost.numAttrSets},`;
                log += ` numBinds: ${dataHost.numSrcBinds}`;
                this.utils.sendMsg(log);

                if(this.udpCmdQueue.length > 15) {
                    this.udpCmdQueue = [];
                    this.udpCmdFlag = false;
                }
                const param: gIF.rdAtIdxParam_t = {
                    ip: rem.address,
                    //port: rem.port,
                    port: UDP_PORT,
                    shortAddr: dataHost.shortAddr,
                    idx: 0,
                }
                if(dataHost.numAttrSets > 0) {
                    let cmd: gIF.udpCmd_t = {
                        type: gConst.RD_ATTR,
                        retryCnt: gConst.RD_HOST_RETRY_CNT,
                        param: JSON.stringify(param),
                    };
                    this.udpCmdQueue.push(cmd);
                }
                if(dataHost.numSrcBinds > 0) {
                    let cmd: gIF.udpCmd_t = {
                        type: gConst.RD_BIND,
                        retryCnt: gConst.RD_HOST_RETRY_CNT,
                        param: JSON.stringify(param),
                    };
                    this.udpCmdQueue.push(cmd);
                }
                if(this.udpCmdQueue.length > 0) {
                    if(this.udpCmdFlag === false) {
                        this.udpCmdFlag = true;
                        this.runCmd();
                    }
                    if(this.runTmoRef === null) {
                        this.runTmoRef = setTimeout(()=>{
                            this.runTmoRef = null;
                            this.udpCmdFlag = true;
                            this.runCmd();
                        }, 3000);
                    }
                }
                break;
            }
            case gConst.SL_MSG_READ_ATTR_SET_AT_IDX: {
                let rxSet = {} as gIF.attrSet_t;
                let msgSeqNum = msgView.getUint8(idx++);
                if(msgSeqNum == this.seqNum) {
                    const param: gIF.rdAtIdxParam_t = JSON.parse(this.udpCmd.param);
                    rxSet.hostShortAddr = param.shortAddr;
                    rxSet.ip = param.ip;
                    rxSet.port = param.port;
                    let status = msgView.getUint8(idx++);
                    if(status == gConst.SL_CMD_OK) {
                        let memIdx = msgView.getUint8(idx++);
                        rxSet.partNum = msgView.getUint32(idx, gConst.LE);
                        idx += 4;
                        rxSet.clusterServer = msgView.getUint8(idx++);
                        rxSet.extAddr = msgView.getFloat64(idx, gConst.LE);
                        idx += 8;
                        rxSet.shortAddr = msgView.getUint16(idx, gConst.LE);
                        idx += 2;
                        rxSet.endPoint = msgView.getUint8(idx++);
                        rxSet.clusterID = msgView.getUint16(idx, gConst.LE);
                        idx += 2;
                        rxSet.attrSetID = msgView.getUint16(idx, gConst.LE);
                        idx += 2;
                        rxSet.attrMap = msgView.getUint16(idx, gConst.LE);
                        idx += 2;
                        rxSet.valsLen = msgView.getUint8(idx++);
                        rxSet.attrVals = [];
                        for(let i = 0; i < rxSet.valsLen; i++) {
                            rxSet.attrVals[i] = msgView.getUint8(idx++);
                        }

                        this.events.publish('attr_set', JSON.stringify(rxSet));

                        param.idx = memIdx + 1;
                        this.udpCmd.param = JSON.stringify(param);
                        this.udpCmd.retryCnt = gConst.RD_HOST_RETRY_CNT;
                        this.udpCmdQueue.push(this.udpCmd);
                        this.runCmd();
                    }
                    else {
                        if(this.udpCmdQueue.length > 0) {
                            this.runCmd();
                        }
                        else {
                            this.seqNum = ++this.seqNum % 256;
                            clearTimeout(this.udpCmdTmoRef);
                            this.udpCmdFlag = false;
                        }
                    }
                }
                break;
            }
            case gConst.SL_MSG_READ_BIND_AT_IDX: {
                let rxBind = {} as gIF.clusterBind_t;
                let msgSeqNum = msgView.getUint8(idx++);
                if(msgSeqNum == this.seqNum) {
                    const param: gIF.rdAtIdxParam_t = JSON.parse(this.udpCmd.param);
                    rxBind.hostShortAddr = param.shortAddr;
                    rxBind.ip = param.ip;;
                    rxBind.port = param.port;
                    let status = msgView.getUint8(idx++);
                    if(status == gConst.SL_CMD_OK) {
                        let memIdx = msgView.getUint8(idx++);
                        rxBind.partNum = msgView.getUint32(idx, gConst.LE);
                        idx += 4;
                        rxBind.extAddr = msgView.getFloat64(idx, gConst.LE);
                        idx += 8;
                        rxBind.srcShortAddr = msgView.getUint16(idx, gConst.LE);
                        idx += 2;
                        rxBind.srcEP = msgView.getUint8(idx++);
                        rxBind.clusterID = msgView.getUint16(idx, gConst.LE);
                        idx += 2;
                        rxBind.dstExtAddr = msgView.getFloat64(idx, gConst.LE);
                        idx += 8;
                        rxBind.dstEP = msgView.getUint8(idx++);

                        this.events.publish('cluster_bind', JSON.stringify(rxBind));

                        param.idx = memIdx + 1;
                        this.udpCmd.param = JSON.stringify(param);
                        this.udpCmd.retryCnt = gConst.RD_HOST_RETRY_CNT;
                        this.udpCmdQueue.push(this.udpCmd);
                        this.runCmd();
                    }
                    else {
                        if(this.udpCmdQueue.length > 0) {
                            this.runCmd();
                        }
                        else {
                            this.seqNum = ++this.seqNum % 256;
                            clearTimeout(this.udpCmdTmoRef);
                            this.udpCmdFlag = false;
                        }
                    }
                }
                break;
            }
            case gConst.SL_MSG_WRITE_BIND: {
                let msgSeqNum = msgView.getUint8(idx++);
                if(msgSeqNum == this.seqNum) {
                    let status = msgView.getUint8(idx++);
                    if(status == gConst.SL_CMD_OK) {
                        this.utils.sendMsg('wr binds status: OK');
                    }
                    else {
                        this.utils.sendMsg('wr binds status: FAIL');
                    }
                    if(this.udpCmdQueue.length > 0) {
                        this.runCmd();
                    }
                    else {
                        this.seqNum = ++this.seqNum % 256;
                        clearTimeout(this.udpCmdTmoRef);
                        this.udpCmdFlag = false;
                    }
                }
                break;
            }
            case gConst.SL_MSG_ZCL_CMD: {
                let msgSeqNum = msgView.getUint8(idx++);
                if(msgSeqNum == this.seqNum) {
                    // ---
                    if(this.udpCmdQueue.length > 0) {
                        this.runCmd();
                    }
                    else {
                        this.seqNum = ++this.seqNum % 256;
                        clearTimeout(this.udpCmdTmoRef);
                        this.udpCmdFlag = false;
                    }
                }
                break;
            }
            default: {
                console.log('unsupported sl command!');
                break;
            }
        }
    }

    /***********************************************************************************************
     * fn          runHostCmd
     *
     * brief
     *
     */
    private runCmd() {

        clearTimeout(this.udpCmdTmoRef);

        if(this.runTmoRef) {
            clearTimeout(this.runTmoRef);
            this.runTmoRef = null;
        }
        this.udpCmd = this.udpCmdQueue.shift();
        if(this.udpCmd) {
            switch(this.udpCmd.type) {
                case gConst.RD_ATTR: {
                    this.reqAttrAtIdx();
                    break;
                }
                case gConst.RD_BIND: {
                    this.reqBindAtIdx();
                    break;
                }
                case gConst.WR_BIND: {
                    this.wrBindReq();
                    break;
                }
                case gConst.ZCL_CMD: {
                    this.zclReq();
                    break;
                }
                default: {
                    //---;
                    break;
                }
            }
        }
        this.udpCmdTmoRef = setTimeout(()=>{
            this.udpCmdTmo();
        }, gConst.RD_HOST_TMO);
    }

    /***********************************************************************************************
     * fn          hostCmdTmo
     *
     * brief
     *
     */
    private udpCmdTmo() {

        this.utils.sendMsg('--- CMD TMO ---', 'red');

        if(this.udpCmd.retryCnt) {
            this.udpCmd.retryCnt--;
            this.udpCmdQueue.push(this.udpCmd);
        }
        if(this.udpCmdQueue.length == 0) {
            this.udpCmdFlag = false;
            return;
        }
        this.udpCmd = this.udpCmdQueue.shift();
        switch (this.udpCmd.type) {
            case gConst.RD_ATTR: {
                this.reqAttrAtIdx();
                break;
            }
            case gConst.RD_BIND: {
                this.reqBindAtIdx();
                break;
            }
            case gConst.WR_BIND: {
                this.wrBindReq();
                break;
            }
            case gConst.ZCL_CMD: {
                this.zclReq();
                break;
            }
            default: {
                //---
                break;
            }
        }
        this.udpCmdTmoRef = setTimeout(()=>{
            this.udpCmdTmo();
        }, gConst.RD_HOST_TMO);
    }

    /***********************************************************************************************
     * fn          reqAttrAtIdx
     *
     * brief
     *
     */
    private reqAttrAtIdx() {

        const param: gIF.rdAtIdxParam_t = JSON.parse(this.udpCmd.param);
        let idx: number;

        this.seqNum = ++this.seqNum % 256;
        idx = 0;
        this.msg.setUint16(idx, gConst.SL_MSG_READ_ATTR_SET_AT_IDX, gConst.LE);
        idx += 2;
        const lenIdx = idx;
        this.msg.setUint8(idx++, 0);
        // cmd data
        const dataStartIdx = idx;
        this.msg.setUint8(idx++, this.seqNum);
        this.msg.setUint16(idx, param.shortAddr, gConst.LE);
        idx += 2;
        this.msg.setUint8(idx++, param.idx);

        const dataLen = idx - dataStartIdx;
        this.msg.setUint8(lenIdx, dataLen);

        this.udpSend(idx, param.ip, param .port);
    }

    /***********************************************************************************************
     * fn          reqBindsAtIdx
     *
     * brief
     *
     */
    private reqBindAtIdx() {

        const param: gIF.rdAtIdxParam_t = JSON.parse(this.udpCmd.param);
        let idx: number;

        this.seqNum = ++this.seqNum % 256;
        idx = 0;
        this.msg.setUint16(idx, gConst.SL_MSG_READ_BIND_AT_IDX, gConst.LE);
        idx += 2;
        const lenIdx = idx;
        this.msg.setUint8(idx++, 0);
        // cmd data
        const dataStartIdx = idx;
        this.msg.setUint8(idx++, this.seqNum);
        this.msg.setUint16(idx, param.shortAddr, gConst.LE);
        idx += 2;
        this.msg.setUint8(idx++, param.idx);

        const dataLen = idx - dataStartIdx;
        this.msg.setUint8(lenIdx, dataLen);

        this.udpSend(idx, param.ip, param .port);
    }

    /***********************************************************************************************
     * fn          wrBinds
     *
     * brief
     *
     */
    wrBind(bind: string) {
        let cmd: gIF.udpCmd_t = {
            type: gConst.WR_BIND,
            retryCnt: gConst.RD_HOST_RETRY_CNT,
            param: bind,
        };
        this.udpCmdQueue.push(cmd);
        if(this.udpCmdFlag == false) {
            this.udpCmdFlag = true;
            this.runCmd();
        }
    }

    /***********************************************************************************************
     * fn          wrBindsReq
     *
     * brief
     *
     */
    private wrBindReq() {

        let req: gIF.hostedBind_t = JSON.parse(this.udpCmd.param);
        let idx: number;

        this.seqNum = ++this.seqNum % 256;
        idx = 0;
        this.msg.setUint16(idx, gConst.SL_MSG_WRITE_BIND, gConst.LE);
        idx += 2;
        const lenIdx = idx;
        this.msg.setUint8(idx++, 0);
        // cmd data
        const dataStartIdx = idx;
        this.msg.setUint8(idx++, this.seqNum);
        this.msg.setUint16(idx, req.hostShortAddr, gConst.LE);
        idx += 2;
        this.msg.setFloat64(idx, req.extAddr, gConst.LE);
        idx += 8;
        this.msg.setUint8(idx++, req.srcEP);
        this.msg.setUint16(idx, req.clusterID, gConst.LE);
        idx += 2;
        this.msg.setFloat64(idx, req.dstExtAddr, gConst.LE);
        idx += 8;
        this.msg.setUint8(idx++, req.dstEP);

        const dataLen = idx - dataStartIdx;
        this.msg.setUint8(lenIdx, dataLen);

        this.udpSend(idx, req.ip, req.port);
    }

    /***********************************************************************************************
     * fn          udpZclCmd
     *
     * brief
     *
     */
    udpZclCmd(zclCmd: string) {
        let cmd: gIF.udpCmd_t = {
            type: gConst.ZCL_CMD,
            retryCnt: 0,
            param: zclCmd,
        };
        this.udpCmdQueue.push(cmd);
        if(this.udpCmdFlag == false) {
            this.udpCmdFlag = true;
            this.runCmd();
        }
    }

    /***********************************************************************************************
     * fn          zclReq
     *
     * brief
     *
     */
    private zclReq() {

        let req: gIF.udpZclReq_t = JSON.parse(this.udpCmd.param);
        let idx: number;

        this.seqNum = ++this.seqNum % 256;
        idx = 0;
        this.msg.setUint16(idx, gConst.SL_MSG_ZCL_CMD, gConst.LE);
        idx += 2;
        const lenIdx = idx;
        this.msg.setUint8(idx++, 0);
        // cmd data
        const dataStartIdx = idx;
        this.msg.setUint8(idx++, this.seqNum);
        this.msg.setFloat64(idx, req.extAddr, gConst.LE);
        idx += 8;
        this.msg.setUint8(idx++, req.endPoint);
        this.msg.setUint16(idx, req.clusterID, gConst.LE);
        idx += 2;
        this.msg.setUint8(idx++, req.hasRsp);
        this.msg.setUint8(idx++, req.cmdLen);
        for(let i = 0; i < req.cmdLen; i++) {
            this.msg.setUint8(idx++, req.cmd[i]);
        }

        const dataLen = idx - dataStartIdx;
        this.msg.setUint8(lenIdx, dataLen);

        this.udpSend(idx, req.ip, req .port);
    }

    /***********************************************************************************************
     * fn          udpSend
     *
     * brief
     *
     */
    private udpSend(len: number, ip: string, port: number) {

        const bufData = this.utils.arrayBufToBuf(this.msgBuf.slice(0, len));

        this.udpSocket.send(bufData, 0, len, port, ip, (err)=>{
            if(err) {
                console.log('UDP ERR: ' + JSON.stringify(err));
            }
        });
    }
}
