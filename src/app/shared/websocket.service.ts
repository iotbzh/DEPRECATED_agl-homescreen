import { Injectable } from "@angular/core";
import { Subject, Subscription, Observable } from 'rxjs/Rx';

import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";
import { environment } from "../../environments/environment";
import { AfbContextService } from "./afbContext.service";
import { AppConfigService } from "./appConfig.service";

export interface IOpened {
    isOpened: boolean;
    remainingRetry?: number;
    error?: string;
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
    private reqId = 0;
    private connectRetry = 0;

    public message: Subject<Object> = new Subject();
    public opened: Subject<IOpened> = new Subject<IOpened>();

    constructor(private AfbContextService: AfbContextService) {
        this.baseUrl = AfbContextService.wsBaseUrl;
        this.afbCtx = AfbContextService;

        this._openWS();
    };

    private _openWS() {
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
                this.message.next({ type: 'closed' });
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
        this.reqId += 1;
        let data = JSON.stringify([this.CALL, this.reqId, method, request]);
        if (environment.debug)
            console.debug('WS SEND: ' + data);
        this.ws.next(data);
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

        let recvMsg;

        switch (ans.jtype) {
            case 'afb-reply':
                recvMsg = this._decode_afb_reply(ans, req);
                break;
            case 'afb-event':
                recvMsg = ans;
                recvMsg['type'] = 'event';
                recvMsg['event'] = recvMsg['event'].replace(/^afm-main\//g, '');
                break;
            default:
                recvMsg = ans;
        }
        this.message.next(recvMsg);
    }

    private _onError(err) {
        this.message.next({ type: 'closed' });
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
            if (this.connectRetry == this.MAX_CONNECTION_RETRY/2)
                this.afbCtx.resetToInitialToken();
        }

        this.opened.next({
            isOpened: false,
            remainingRetry: this.MAX_CONNECTION_RETRY - this.connectRetry,
            error: msgErr });
    }

    private _decode_afb_reply(ans, req) {
        let res = ans;

        if (ans.response) {
            if (ans.response.token) {
                if (/New Token/.test(ans.response.token)) {
                    this.afbCtx.startRefresh(req, this);
                    this.opened.next({ isOpened: true });
                }
                else if (/Token was refreshed/.test(ans.response.token)) {
                    res = {
                        type: "New Token",
                        token: req.token
                    }
                }
            }
            else if (ans.response.runnables) {
                res = {
                    type: "runnables",
                    data: { apps: ans.response.runnables }
                };
            } else if (ans.response.start) {
                res = {
                    type: "start",
                    data: {
                        app: ans.response.app
                    }
                };
            }
        }
        else if (ans.request) {
            // handle afb-reply type request failed
            res = {
                type: "request",
                data: ans.request
            }
        }

        return res;
    }
}