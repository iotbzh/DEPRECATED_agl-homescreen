import { Injectable } from "@angular/core";
import { Subject, Subscription, Observable } from 'rxjs/Rx';
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";
import { environment } from "../../environments/environment";
import { AfbContextService } from "./afbContext.service";

@Injectable()
export class WebSocketService {

    private readonly CALL = 2;
    private readonly RETOK = 3;
    private readonly RETERR = 4;
    private readonly EVENT = 5;
    private readonly ws_sub_protos = ["x-afb-ws-json1"];

    private ws: WebSocketSubject<Object>;
    private socket: Subscription;
    private url: string;
    private afbCtx: AfbContextService;
    private reqId = 0;

    public message: Subject<Object> = new Subject();
    public opened: Subject<boolean> = new Subject<boolean>();

    constructor() {
        this.url = 'ws://' + environment.service.ip;
        if (environment.service.port)
            this.url += ':' + environment.service.port;
        this.url += environment.service.api_url;
        this.afbCtx = new AfbContextService(this, environment.session);
    };

    public close(): void {
        this.socket.unsubscribe();
        this.ws.complete();
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
        // FIXME: do we still need to manage id to process resolve, reject callbacks ???
        this.reqId += 1;
        let data = JSON.stringify([this.CALL, this.reqId, method, request]);
        //console.debug('DEBUG SEND: ' + data);
        this.ws.next(data);
    }

    public start(): void {
        let self = this;
        let url = this.url;
        if (this.afbCtx.token) {
            url += '?x-afb-token=' + this.afbCtx.token;
            if (this.afbCtx.uuid)
                url += '&x-afb-uuid=' + this.afbCtx.uuid;
        }

        this.ws = new WebSocketSubject({
            url: url,
            protocol: this.ws_sub_protos
        });

        this.socket = this.ws.subscribe({
            next: (data: MessageEvent) => this.onReceiveMessage(data),
            error: () => {
                self.opened.next(false);
                this.message.next({ type: 'closed' });
                self.socket.unsubscribe();
                alert('ERROR, cannot established Websocket connection, url=' + url);
                /*
                setTimeout( () => {
                    self.start();
                }, 1000 );
                */
            },
            complete: () => {
                this.message.next({ type: 'closed' });
            }
        });
        this.call("auth/connect", null);
    }

    private onReceiveMessage(data: MessageEvent): void {

        let code, id, ans, req;
        try {
            //console.debug('DEBUG RECV: ' + JSON.stringify(data));
            code = data[0];
            id = data[1];
            ans = data[2];
            req = ans.request
        } catch (err) {
            console.log(err);
        }

        // FIXME: make responses compatible with fake-server / current code
        let res = ans;
        if (ans.response) {
            if (ans.response.token) {
                if (/New Token/.test(ans.response.token)) {
                    this.afbCtx.startRefresh(req);
                    this.opened.next(true);
                }
                else if (/Token was refreshed/.test(ans.response.token)) {
                    res = {
                        type: "New Token",
                        token: req.token
                    }
                }
            }
            else if (ans.response.runnables) {
                ans.response.runnables.map((m) => {
                    m.isRunning = false
                    m.isPressed = false;
                    let shortid = m.id.split('@')[0];
                    switch (shortid) {
                        case 'phone':
                        case 'settings':
                            m.authRequired = true;
                            m.name = shortid;
                            break;
                        case 'mediaplayer':
                            m.name = 'multimedia';
                            break;
                        case 'pio':
                            m.authRequired = true;
                            m.name = 'point';
                            break;
                        case 'radio':
                            m.name = 'radio';
                            m.id = 'radio';
                            break;
                        default:
                            m.name = shortid;
                            break;
                    }

                });
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

        this.message.next(res);
    };
}