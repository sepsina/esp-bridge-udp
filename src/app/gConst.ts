import * as gIF from './gIF';
export const LE = true;
export const BE = false;
export const HEAD_LEN = 5;
export const LEN_IDX = 2;
export const CRC_IDX = 4;

export const DFLT_IMG_DIR = 'files';
export const DFLT_BKG_IMG = '../../assets/floor_plan.jpg';
export const DFLT_IMG_NAME = 'floor_plan';

export const SL_START_CHAR = 0x01;
export const SL_ESC_CHAR = 0x02;
export const SL_END_CHAR = 0x03;

export const SL_MSG_LOG = 0x8001;

export const SL_MSG_HOST_ANNCE = 0x0A01;
export const SL_MSG_READ_ATTR_SET = 0x0A02;
export const SL_MSG_WRITE_ATTR_SET = 0x0A03;
export const SL_MSG_READ_ATTR_SET_AT_IDX = 0x0A04;
export const SL_MSG_READ_BIND = 0x0A05;
export const SL_MSG_WRITE_BIND = 0x0A06;
export const SL_MSG_READ_BIND_AT_IDX = 0x0A07;
export const SL_MSG_HOST_ERROR = 0x0A08;
export const SL_MSG_TESTPORT = 0x0A09;
export const SL_MSG_ZCL_CMD = 0x0A0A;
export const SL_MSG_ZDP_CMD = 0x0A0B;
export const SL_MSG_ZDO_CMD = 0x0A0C;
export const SL_MSG_USB_CMD = 0x0A0D;

export const SL_CMD_OK = 0;
export const SL_CMD_FAIL = 1;

export const MANU_NAME_LEN = 12;
export const MODEL_ID_LEN = 12;
export const DATE_CODE_LEN = 8;

export const CLUSTER_ID_GEN_BASIC = 0x0000;
export const CLUSTER_ID_POWER_CFG = 0x0001;
export const CLUSTER_ID_GEN_ON_OFF = 0x0006;
export const CLUSTER_ID_LEVEL_CTRL = 0x0008;
export const CLUSTER_ID_MS_TEMPERATURE_MEASUREMENT = 0x0402;
export const CLUSTER_ID_MS_PRESSURE_MEASUREMENT = 0x0403;
export const CLUSTER_ID_MS_RH_MEASUREMENT = 0x0405;

export const RD_HOST_RETRY_CNT = 3;

export const HOSTED_BINDS_TTL = 3; // minutes
export const ATTR_SET_TTL = 3; // minutes

export const RD_HOST_TMO = 400;
export const REQ_TMO = 50;

export const ZB_BRIDGE = 1;

export const HTU21D_005_BASE = 500;
export const HTU21D_005_T = 501;
export const HTU21D_005_RH = 502;
export const HTU21D_005_BAT = 503;

export const SH_006_BASE = 600;
export const SH_006_SH = 601;
export const SH_006_BAT = 602;

export const BME280_007_BASE = 700;
export const BME280_007_T = 701;
export const BME280_007_RH = 702;
export const BME280_007_P = 703;
export const BME280_007_BAT = 704;

export const DBL_SW_008_BASE = 800;
export const DBL_SW_008_PB_1 = 801;
export const DBL_SW_008_PB_2 = 802;
export const DBL_SW_008_BAT = 803;

export const SSR_009_BASE = 900;
export const SSR_009_RELAY = 901;

export const ACTUATOR_010_BASE = 1000;
export const ACUATOR_010_ON_OFF = 1001;

//export const MAX_DST_BINDS = 4;
//export const MAX_SRC_BINDS = 14;

export const ATTR_TTL = 600; // seconds
export const ATTR_VALID_TTL = 120; // seconds
export const BIND_TTL = 600; // seconds
export const SET_TTL = 600; // seconds

export const BRIDGE_ID_REQ = 0x0001;
export const BRIDGE_ID_RSP = 0x0002;
export const ON_OFF_ACTUATORS = 0x0003;
export const UDP_ZCL_CMD = 0x0004;
export const T_SENSORS = 0x0005;
export const RH_SENSORS = 0x0006;
export const P_ATM_SENSORS = 0x0007;
export const BAT_VOLTS = 0x0008;

export const DEG_C = 1;
export const DEG_F = 2;
export const M_BAR = 3;
export const IN_HG = 4;

//export const PUB_IP_KEY = 'public-ip';
//export const FREE_DNS_KEY = 'free-dns';
//export const SCROLLS_KEY = 'scrolls';

export const NG_STYLE = {
    color: 'black',
    bgColor: 'transparent',
    fontSize: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
    borderRadius: 0,
    paddingTop: 4,
    paddingRight: 6,
    paddingBottom: 2,
    paddingLeft: 6
};

export const RD_ATTR  = 0;
export const RD_BIND = 1;
export const WR_BIND = 2;
export const ZCL_CMD  = 3;

export const SL_LIST_PORTS = 0;
export const SL_ATTR_SET = 1;
export const SL_SRC_BIND = 2;
export const SL_WR_BIND = 3;
export const SL_ZCL_CMD = 4;
export const SL_CLOSE_CMD = 5;

export const THERMOSTAT_HYSTERESIS = 0.5


