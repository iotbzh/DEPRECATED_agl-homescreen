import { Injectable } from "@angular/core";

import { environment } from "../../environments/environment";
import { WebSocketService, IMessage } from "./websocket.service";

@Injectable()
export class AfbContextService {

    public environment: any;

    private _uuid: string = undefined;
    private _token: string = undefined;
    private _timeout: number;
    private _pingrate: number;
    private _ws: WebSocketService;
    private _tmoInterval: any = null;
    private _service: any;

    // number of seconds that token will be refreshed before it will fire
    private _TIMEOUT_LIFEGUARD: number = 1000;

    constructor() {
        this.environment = environment;

        let sess = this.environment.session;
        if (sess) {
            this._token = this.getCookie('AGL_TOKEN') || sess.initial;
            this._uuid = this.getCookie('AGL_UUID');
            this._timeout = sess.timeout * 1000 || 0;
            // TODO: add ping monitor feature
            this._pingrate = sess.pingrate || 0;

            if (this.environment.debug) {
                console.debug('Token initial: ', sess.initial);
                console.debug('cookieToken', sess.cookieToken);
            }
        }

        this._service = this.environment.service;
        if (!this._service) {
            this._service = {
                ip: 'localhost',
                port: null,
                api_url: '/api'
            };
        }
    };

    get baseUrl(): string {
        let url = this._service.ip;
        if (this._service.port)
            url += ':' + this._service.port;
        url += this._service.api_url;
        return url;
    }

    get wsBaseUrl(): string { return 'ws://' + this.baseUrl };

    get httpBaseUrl(): string { return 'http://' + this.baseUrl };

    get targetHostIp(): string { return this._service.ip };

    public getUrl(proto: string, method?: string): string {
        let url = (proto == 'http') ? this.httpBaseUrl : this.wsBaseUrl;
        if (method)
            url += '/' + method;
        if (this.token) {
            url += '?x-afb-token=' + this.token;
            if (this.uuid)
                url += '&x-afb-uuid=' + this.uuid;
        }
        return url;
    }

    // FIXME - better to use a package like angular2-cookie
    private setCookie(cname, cvalue, exdays): void {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    private getCookie(cname): string {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) {
                var ret = c.substring(name.length, c.length);
                if (ret != 'null') return ret;
            }
        }
        return null;
    };

    get token(): string {
        return this._token;
    }
    set token(val: string) {
        this.setCookie('AGL_TOKEN', val, 1);
        this._token = val;
    }

    resetToInitialToken(): void {
        this.token = environment.session.initial;
        this.uuid = null;
    }

    get uuid(): string {
        return this._uuid;
    }
    set uuid(val: string) {
        this.setCookie('AGL_UUID', val, 1);
        this._uuid = val;
    }

    startRefresh(req, webSocketService?: WebSocketService) {
        let self = this;
        this._ws = webSocketService;

        if (this._timeout <= 0)
            return;
        if (this._tmoInterval)
            return;
        if (!this._ws) {
            console.error('Invalid WebSocketService');
            return;
        }

        if (req && req.token)
            this.token = req.token;
        if (req && req.uuid)
            this.uuid = req.uuid;

        this._ws.message.subscribe((response: IMessage) => {
            if (response.type == 'New Token' && response.res.token)
                self.token = response.res.token;
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
        if (this._ws)
            this._ws.message.unsubscribe();
    }
}