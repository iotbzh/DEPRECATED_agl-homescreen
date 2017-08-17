import { Injectable } from "@angular/core";
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";
import { environment } from '../../environments/environment';
import { AfbContextService } from "./afbContext.service";

export interface IOpened {
    isOpened: boolean;
    remainingRetry?: number;
    error?: string;
}

export interface IRequest {
    id: string,
    method: string,
    request: string
}

export interface IMessage {
    type: string,
    original_request: any,
    event?: string,
    req: any,
    res: any
}

@Injectable()
export class WebSocketService {

    private readonly CALL = 2;
    private readonly RETOK = 3;
    private readonly RETERR = 4;
    private readonly EVENT = 5;
    private readonly ws_sub_protos = ["x-afb-ws-json1"];
    private readonly MAX_CONNECTION_RETRY = environment.maxConnectionRetry || 10;

    private ws: WebSocketSubject<Object>;
    private socket: Subscription;
    private baseUrl: string;
    private afbCtx: AfbContextService;
    private readonly reqIdBase: string = <string><any>(Math.floor(Math.random() * 10e6));
    private reqId: number = 0;
    private requests: Array<IRequest>;
    private connectRetry = 0;

    public message: Subject<IMessage> = new Subject<IMessage>();
    public opened: Subject<IOpened> = new Subject<IOpened>();

    constructor(private AfbContextService: AfbContextService) {
        this.baseUrl = AfbContextService.wsBaseUrl;
        this.afbCtx = AfbContextService;

        this._openWS();
    };

    private _openWS() {
        this.requests = [];
        this.ws = new WebSocketSubject({
            url: this.afbCtx.getUrl('ws'),
            protocol: this.ws_sub_protos,
            openObserver: {
                next: () => {
                    this.connectRetry = 0;
                    if (environment.debug)
                        console.debug('WS open');
                },
                error: (err) => console.error('WS open error: ', err)
            }
        });

        this.socket = this.ws.subscribe({
            next: (data: MessageEvent) => this._onReceiveMessage(data),
            error: (err) => this._onError(err),
            complete: () => {
                this.message.next({
                    type: 'closed',
                    original_request: null,
                    req: null,
                    res: null
                });
            }
        });

        this.call("auth/connect", null);
    }

    public close(): void {
        this.socket.unsubscribe();
        this.ws.complete();
    }

    public restart(resetToken?: boolean): void {
        if (this.isConnectionUp)
            this.close();

        if (resetToken)
            this.afbCtx.resetToInitialToken();

        this._openWS();
    }

    public get isConnectionUp(): boolean {
        return (!this.socket.closed);
    }

    public sendMessage(message: string): void {
        // Make message format backward compatible
        let msg = JSON.parse(message);
        let method = msg.api;
        delete msg.api;
        let request = msg;
        this.call(method, request);
    }

    public call(method, request): void {
        let requestId = this.reqIdBase + '_' + this.reqId;
        let data = JSON.stringify([this.CALL, requestId, method, request]);
        this.requests[requestId] = { id: requestId, method: method, request: request };
        if (environment.debug)
            console.debug('WS SEND (' + requestId + '): ' + data);
        this.ws.next(data);
        this.reqId += 1;
    }

    private _onReceiveMessage(data: MessageEvent): void {
        let code, id, ans, req;
        try {
            if (environment.debug)
                console.debug('WS RECV: ' + JSON.stringify(data));
            code = data[0];
            id = data[1];
            ans = data[2];
            req = ans.request
        } catch (err) {
            console.log(err);
        }

        let recvMsg: IMessage = <IMessage>{};

        switch (ans.jtype) {
            case 'afb-reply':
                let rep = this._decode_afb_reply(ans, req);
                recvMsg.type = rep.type;
                recvMsg.res = rep.res;

                // Retrieve request parameters with id
                if (this.requests[id] == null)
                    console.error('ERROR unknown id ', id, ' in ', this.requests);

                recvMsg.req = this.requests[id].request || {};
                recvMsg.original_request = this.requests[id];

                delete this.requests[id];
                break;

            case 'afb-event':
                recvMsg = ans;
                recvMsg.type = 'event';
                recvMsg.event = recvMsg.event.replace(/^afm-main\//g, '');
                break;

            default:
                console.error('Unsupported jtype: ', ans.jtype);
                recvMsg = ans;
        }

        if (recvMsg.type == 'response' && recvMsg.res.token) {
            this.afbCtx.startRefresh(req, this);
            this.opened.next({ isOpened: true });
        } else {
            this.message.next(recvMsg);
        }
    }

    private _onError(err) {
        this.message.next({
            type: 'closed',
            original_request: null,
            req: null,
            res: null
        });
        this.socket.unsubscribe();

        let msgErr;
        if (this.connectRetry > this.MAX_CONNECTION_RETRY) {
            msgErr = 'Websocket connection failure, url=' + this.afbCtx.getUrl('ws')
        } else {
            msgErr = 'Websocket connection failure, url=' + this.afbCtx.getUrl('ws') + '\nRetry ' + this.connectRetry + ' / ' + this.MAX_CONNECTION_RETRY;
            if (environment.debug)
                console.debug(msgErr);

            setTimeout(() => this._openWS(), 1000);

            this.connectRetry += 1;
            if (this.connectRetry == this.MAX_CONNECTION_RETRY / 2)
                this.afbCtx.resetToInitialToken();
        }

        this.opened.next({
            isOpened: false,
            remainingRetry: this.MAX_CONNECTION_RETRY - this.connectRetry,
            error: msgErr
        });
    }

    private _decode_afb_reply(ans, req) {
        let result = ans;

        if (ans.response) {
            if (/Token was refreshed/.test(ans.response.token)) {
                result = {
                    type: "New Token",
                    res: { token: req.token }
                }
            }
            else if (ans.response.runnables) {
                result = {
                    type: "runnables",
                    res: { apps: ans.response.runnables }
                };
            }
            else if (ans.response.runid) {
                result = {
                    type: "start",
                    res: ans.response
                };
            }
            // handle afb-reply type request success
            else if (ans.request) {
                result = {
                    type: "response",
                    res: ans.request
                }
            }
        }
        else if (ans.request) {
            // handle afb-reply type request failed
            result = {
                type: "response",
                res: ans.request
            }
        }

        return result;
    }
}