"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
const uuid_1 = require("uuid");
const client_1 = require("./src/client");
class WebSocketServer {
    constructor() {
        this.clients = {};
        var that = this;
        var client_options = {
            client_id: ''
        };
        this.serverHandler = function serverHandler(client) {
            client_options.client_id = (0, uuid_1.v4)();
            const client_class = new client_1.Client(that, client, client_options);
            that.clients[client_options.client_id] = client_class;
        };
    }
    deleteClientClass(client_id) {
        delete this.clients[client_id];
    }
}
exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=index.js.map