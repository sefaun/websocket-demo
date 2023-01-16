/// <reference types="node" />
import { Socket } from "net";
import { WebSocketServer } from '../index';
import { ServerOptions } from './types';
export declare class Client {
    private that;
    private client;
    private options;
    private request;
    private hand_shake_status;
    constructor(that: WebSocketServer, client: Socket, options: ServerOptions);
    private createClient;
    private serverJobs;
    private sendHandShakeResponse;
    private fetchRequestHeader;
    private fetchRequestMethod;
    private fetchRequestPath;
    private fetchRequestProtocolVersion;
    private checkMethod;
    private socketWrite;
    private clientEnd;
}
