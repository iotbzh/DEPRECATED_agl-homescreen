import { Injectable } from "@angular/core";

import { WebSocketService } from "./websocket.service";

@Injectable()
export class AfbContextService {

    private _uuid: string = undefined;
    private _token: string = undefined;
    private _timeout: number;
    private _pingrate: number;
    private _ws: WebSocketService;
    private _tmoInterval: number = null;

    // number of seconds before
    private _TIMEOUT_LIFEGUARD: number = 1000;

    constructor(
        webSocketService: WebSocketService,
        session: {
            initial: string,
            timeout?: number,
            pingrate?: number
        }) {

        this._token = session.initial;
        this._timeout = session.timeout * 1000 || 0;
        // TODO: add ping monitor feature
        this._pingrate = session.pingrate || 0;
        this._ws = webSocketService;
    }

    get token(): string {
        return this._token;
    }
    set token(val: string) {
        this._token = val;
    }

    get uuid(): string {
        return this._uuid;
    }
    set uuid(val: string) {
        this._uuid = val;
    }

    startRefresh(req) {
        let self = this;

        if (this._timeout <= 0)
            return;
        if (this._tmoInterval)
            return;

        if (req && req.token)
            this.token = req.token;
        if (req && req.uuid)
            this.uuid = req.uuid;

        this._ws.message.subscribe((response: any) => {
            if (response.type && response.type == 'New Token' && response.token)
                self.token = response.token;
        });

        this._tmoInterval = setInterval(
            () => this._ws.call("auth/refresh", null),
            Math.max(this._timeout - this._TIMEOUT_LIFEGUARD, this._TIMEOUT_LIFEGUARD)
        );
    }

    stopRefresh() {
        if (this._timeout <= 0)
            return;
        clearInterval(this._tmoInterval);
        this._tmoInterval = null;
        this._ws.message.unsubscribe();
    }
}