
export enum eRxState {
    E_STATE_RX_WAIT_START,
    E_STATE_RX_WAIT_TYPELSB,
    E_STATE_RX_WAIT_TYPEMSB,
    E_STATE_RX_WAIT_LENLSB,
    E_STATE_RX_WAIT_LENMSB,
    E_STATE_RX_WAIT_CRC,
    E_STATE_RX_WAIT_DATA
}

export interface rdHost_t {
    queue: number[];
    busy: boolean;
    tmoRef: any;
    rdType: string;
    idx: number;
    retryCnt: number;
}

export interface slCmd_t {
    seqNum: number;
    ttl: number;
    cmdID: number;
    hostShortAddr: number;
    ip: string;
    port: number;
}

export interface dataHost_t {
    shortAddr: number;
    extAddr: number;
    numAttrSets: number;
    numSrcBinds: number;
}
export interface attrSet_t {
    ip: string;
    port: number;
    hostShortAddr: number;
    partNum: number;
    clusterServer: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    attrMap: number;
    valsLen: number;
    attrVals: number[];
}
export interface attrSpec_t {
    attrID: number;
    isVisible: boolean;
    isSensor: boolean;
    hasHistory: boolean;
    formatedVal: string;
    timestamp: number;
    attrVal: number;
}
export interface nsPos_t {
    x: number;
    y: number;
}
export interface ngStyle_t {
    color: string;
    bgColor: string;
    fontSize: number;
    //border: string;
    borderWidth: number;
    borderStyle: string;
    borderColor: string;
    borderRadius: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}
export interface valCorr_t{
    units: number;
    slope: number;
    offset: number;
}

export interface hostedSet_t {
    timestamp: number;
    ip: string;
    port: number;
    hostShortAddr: number;
    partNum: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    setVals: any;
}

export interface hostedAttr_t {
    drag: boolean;
    isSel: boolean;
    timestamp: number;
    pos: nsPos_t;
    name: string;
    style: ngStyle_t;
    valCorr: valCorr_t;
    ip: string;
    port: number;
    hostShortAddr: number;
    partNum: number;
    clusterServer: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    attrID: number;
    isValid: boolean;
    isSensor:boolean;
    formatedVal: string;
    timestamps: number[];
    attrVals: number[];
}

export interface attrKey_t {
    shortAddr: number;
    endPoint: number;
    clusterID: number;
    attrSetID: number;
    attrID: number;
}

export interface storedAttr_t {
    attrName: string;
    pos: nsPos_t;
    style: ngStyle_t;
    valCorr: valCorr_t;
}

export interface bindDst_t {
    dstExtAddr: number;
    dstEP: number;
}
export interface hostedBind_t {
    timestamp: number;
    ip: string;
    port: number;
    name: string;
    partNum: number;
    hostShortAddr: number;
    extAddr: number;
    srcShortAddr: number;
    srcEP: number;
    clusterID: number;
    dstExtAddr: number;
    dstEP: number;
}
export interface clusterBind_t {
    ip: string;
    port: number;
    partNum: number;
    hostShortAddr: number;
    extAddr: number;
    srcShortAddr: number;
    srcEP: number;
    clusterID: number;
    dstExtAddr: number;
    dstEP: number;
}
export interface bind_t {
    valid: boolean;
    ip: string;
    port: number;
    partNum: number;
    extAddr: number;
    name: string;
    clusterID: number;
    shortAddr: number;
    endPoint: number;
}

export interface storedBind_t {
    bindName: string;
}

export interface descVal_t {
    key: string;
    value: string
}

export  interface partDesc_t {
    partNum: number;
    devName: string;
    part: string;
    url: string;
}

export  interface part_t {
    devName: string;
    part: string;
    url: string;
}

export interface scroll_t {
    name: string;
    yPos: number;
}

export interface usbId_t {
    pid: number;
    vid: number;
}

export interface udpZclReq_t {
    ip: string;
    port: number;
    extAddr: number;
    endPoint: number;
    clusterID: number;
    hasRsp: number;
    cmdLen: number;
    cmd: number[]
}

export interface dns_t {
    user: string;
    psw: string;
    domain: string;
    token: string;
}

export interface slMsg_t {
    type: number;
    data: number[];
}

export interface hostCmd_t {
    shortAddr: number;
    type: number;
    idx: number;
    retryCnt: number;
    param:string;
}
/*
export interface udpCmd_t {
    seqNum: number;
    ttl: number;
    cmdID: number;
    hostShortAddr: number;
    ip: string;
    port: number;
}
*/
export interface imgDim_t {
    width: number;
    height: number;
}

export interface workerCmd_t {
    type: number;
    cmd: any;
}

export interface thermostatActuator_t {
    name: string;
    ip: string;
    port: number;
    extAddr: number;
    endPoint: number;
}

export interface thermostat_t {
    name: string;
    ip: string;
    port: number;
    partNum: number;
    extAddr: number;
    setPoint: number;
    prevSetPoint: number;
    workPoint: number;
    hysteresis: number;
    shortAddr: number;
    endPoint: number;
    actuators: thermostatActuator_t[];
}

export interface on_off_actuator_t {
    valid: boolean
    name: string;
    ip: string;
    port: number;
    partNum: number;
    extAddr: number;
    shortAddr: number;
    endPoint: number;
}

export interface tempEvent_t {
    temp: number;
    extAddr: number;
    endPoint: number;
}

export interface msgLogs_t {
    text: string;
    color: string;
    id: number;
}

export interface udpCmd_t {
    type: number;
    retryCnt: number;
    param:string;
}

export interface rdAtIdxParam_t {
    ip: string;
    port: number;
    shortAddr: number;
    idx: number;
}





