"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const crypto_1 = __importDefault(require("crypto"));
const enums_1 = require("./enums");
class Client {
    constructor(that, client, options) {
        this.that = that;
        this.client = client;
        this.options = options;
        this.request = {
            method: "",
            path: "",
            protocol_version: "",
            header: "",
            header_datas: []
        };
        this.hand_shake_status = false;
        this.createClient();
    }
    createClient() {
        var request_data = "";
        var request_header_flag = false;
        this.client.on("error", (_err) => this.that.deleteClientClass(this.options.client_id));
        this.client.on("end", () => this.that.deleteClientClass(this.options.client_id));
        this.client.on('data', (data) => {
            if (this.hand_shake_status === false) {
                request_data += data.toString();
                if (request_header_flag === true && request_data === "") {
                    this.clientEnd();
                }
                //For Header
                if (request_data.split(enums_1.seperators.MULTI_COMMAND_SEPERATOR)[1] === '' && request_header_flag === false) {
                    request_header_flag = true;
                    this.request.header = request_data.split(enums_1.seperators.MULTI_COMMAND_SEPERATOR)[0];
                    this.fetchRequestHeader();
                    this.serverJobs();
                }
            }
            else {
                //Other Messages after handshake
                console.log(data);
            }
        });
    }
    serverJobs() {
        this.sendHandShakeResponse();
    }
    sendHandShakeResponse() {
        if (this.request.header.indexOf(enums_1.sec_websocket_key) !== -1) {
            let secret_key = '';
            for (const item of this.request.header_datas) {
                if (item.hasOwnProperty(enums_1.sec_websocket_key)) {
                    secret_key = item[enums_1.sec_websocket_key];
                    break;
                }
            }
            if (!secret_key) {
                this.clientEnd();
            }
            const key = crypto_1.default.createHash("sha1").update(`${secret_key}${enums_1.ws_public_key}`, "binary").digest("base64");
            this.socketWrite(`HTTP/1.1 101 Switching Protocols\r\nX-Powered: SEFAUN\r\nUpgrade: websocket\r\nConnection: upgrade\r\nSec-WebSocket-Accept: ${key}\r\n\r\n`);
            this.hand_shake_status = true;
            //Send Test Hello Message To Client
            this.socketWrite(Buffer.from([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]));
        }
        else {
            this.clientEnd();
        }
    }
    fetchRequestHeader() {
        const header_items = this.request.header.split(enums_1.seperators.COMMAND_SEPERATOR);
        for (let i = 0; i < header_items.length; i++) {
            if (i === 0) {
                this.fetchRequestMethod(header_items[i]);
                this.fetchRequestPath(header_items[i]);
                this.fetchRequestProtocolVersion(header_items[i]);
                continue;
            }
            const key_value = header_items[i].split(':');
            this.request.header_datas.push({ [key_value[0]]: key_value[1].trim() });
        }
    }
    fetchRequestMethod(data) {
        this.checkMethod(data.split(' ')[0]);
    }
    fetchRequestPath(data) {
        this.request.path = data.split(' ')[1];
    }
    fetchRequestProtocolVersion(data) {
        this.request.protocol_version = data.split(' ')[2];
    }
    checkMethod(method) {
        if (method !== enums_1.get_method) {
            this.clientEnd();
        }
    }
    socketWrite(data) {
        this.client.write(data);
    }
    clientEnd() {
        //End Client
        this.client.end();
        //Clear Class
        this.that.deleteClientClass(this.options.client_id);
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map