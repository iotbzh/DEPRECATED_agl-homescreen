import { Injectable } from "@angular/core";
import { Http, Response } from '@angular/http';
import { Subject } from "rxjs/Subject";
import { Observable } from 'rxjs/Observable';

import { WebSocketService, IOpened, IMessage } from "./websocket.service";
import { AfbContextService } from "./afbContext.service";

export interface App {
    id: string;
    name: string;
    shortname: string;
    version: string;
    author: string;
    description: string;
    filename?: string;
    authRequired?: boolean;
    iconUrl?: string;
    isRunning?: boolean;
    runId?: number,
    runUri?: string,
    isInstalled?: boolean,
    extend?: any,
}

@Injectable()
export class AfmMainService {
    public connectionState: Subject<IOpened> = new Subject<IOpened>();
    public startAppResponse: Subject<{ apps: App[], app: App, res: Object }> = new Subject<{ apps: App[], app: App, res: Object }>();
    public stopAppResponse: Subject<{ apps: App[], app: App, res: Object }> = new Subject<{ apps: App[], app: App, res: Object }>();
    public detailsResponse: Subject<Object> = new Subject();
    public runnablesResponse: Subject<App[]> = new Subject<App[]>();
    public startOnceResponse: Subject<Object> = new Subject();
    public eventsResponse: Subject<Object> = new Subject();
    public requestResponse: Subject<Object> = new Subject();

    private readonly baseLocalIconUrl = './assets/svg/';
    private apps: Array<App> = [];

    constructor(private webSocketService: WebSocketService,
        private afbContextService: AfbContextService, private http: Http) {

        this.webSocketService.opened.subscribe((state: IOpened) => {
            this.connectionState.next(state);
        });

        this.webSocketService.message.subscribe((response: IMessage) => {
            let req = response.req;
            let res = response.res;
            switch (response.type) {
                case "runnables":
                    if (res && res.apps && res.apps instanceof Array) {
                        // FIXME removed
                        res.apps.forEach(m => this._updateApps(m));

                    } else {
                        console.error('Invalid runnables response (not an Array)', response);
                    }
                    this.runnablesResponse.next(this.apps);
                    break;

                case "details":
                    // TODO
                    // this.detailsApp[appId] = res;
                    this.detailsResponse.next(res);
                    break;

                case "start":
                    let el: App[] = this.apps.filter(r => r.id == req.id);
                    if (!(el && el.length)) {
                        console.error('Response error: cannot retrieve app id ', req.id);
                        break;
                    }
                    el[0].isRunning = true;
                    el[0].runId = res.runid;
                    if (res.uri) {
                        el[0].runUri = res.uri.replace("%h", this.afbContextService.targetHostIp);
                    }
                    this.startAppResponse.next({ apps: this.apps, app: el[0], res: res });
                    break;

                case "once":
                    this.startOnceResponse.next(response);
                    break;

                case "event":
                    this.eventsResponse.next(response);
                    break;

                case "response":
                    if (req.runid) {
                        let el = this.apps.filter(r => r.runId == req.runid);
                        if (!(el && el.length)) {
                            console.error('Response error: cannot retrieve app runid ', req.runid);
                            break;
                        }
                        el[0].isRunning = false;
                        delete el[0].runId;
                        delete el[0].runUri;
                        this.stopAppResponse.next({ apps: this.apps, app: el[0], res: res });
                    } else {
                        this.requestResponse.next(response);
                    }
                    break;

                default: break;
            }
        });
    }

    private _updateApps(elem: any): void {
        let app: App = {
            id: elem.id,
            name: elem.name,
            shortname: elem.shortname,
            version: elem.version,
            author: elem.author,
            description: elem.description,
            filename: '',
            authRequired: false,
            iconUrl: 'icons/' + elem.id + '?token=' + this.afbContextService.token,
            isRunning: false,
            isInstalled: true,
        };

        // Rename some apps
        app.shortname = app.id.split('@')[0];
        switch (app.shortname) {
            case 'phone':
            case 'settings':
                app.authRequired = true;
                app.name = app.shortname;
                break;
            case 'mediaplayer':
                app.name = 'multimedia';
                break;
            case 'poi':
                app.authRequired = true;
                app.name = 'point';
                break;
            default:
                app.name = app.shortname;
                break;
        }

        // hardcode some icon (local image)
        switch (app.name) {
            case 'hvac':
            case 'navigation':
            case 'phone':
            case 'radio':
            case 'multimedia':
            case 'connectivity':
            case 'dashboard':
            case 'settings':
            case 'point':
                app.iconUrl = this.baseLocalIconUrl + app.name + '-circle.svg';
                break;
        }

        this.update(app.id, app);
    }

    private _sendMessage(cmd, args?) {
        let msg = args || {};
        msg.api = "afm-main/" + cmd;
        this.webSocketService.sendMessage(JSON.stringify(msg));
    }

    public update(appId: string, data: App) {
        let idx = this.apps.findIndex((elem) => elem.id == appId);
        if (idx != -1) {
            for (let attr in data)
                this.apps[idx][attr] = data[attr];
        } else {
            this.apps.push(data);
        }
        return this.apps;
    }

    public startApp(app, mode?: string) {
        let md = mode || 'auto';
        this._sendMessage('start', { id: app.id, mode: md });
    }

    public stopApp(app) {
        if (!app.runId)
            console.error('Invalid runId ', app);
        this._sendMessage('terminate', { runid: app.runId });
    }

    public getRunnables(forceRefresh?: boolean) {
        let frRsh = forceRefresh || false
        if (!frRsh && this.apps && this.apps.length > 0)
            this.runnablesResponse.next(this.apps);
        else
            this._sendMessage('runnables');
    }

    public getDetails(appId: string) {
        /* TODO: */
    }

    public addNewApp(app: App) {
        if (!app.id)
            console.error('Invalid app (undef app.id) ', app);
        this.update(app.id, app);
    }

    public removeApp(appId: string) {
        let idx = this.apps.findIndex((elem) => elem.id == appId);
        if (idx != -1)
            this.apps.splice(idx, 1);
    }

    public deleteApp(app) {
        this.removeApp(app.id);
        this._sendMessage('uninstall', app);
    }

    public get isConnectionUp(): boolean {
        return this.webSocketService.isConnectionUp;
    }

    public restartConnection(resetToken?: boolean): void {
        this.webSocketService.restart(resetToken);
    }

    public isIconValid(app): Observable<boolean> {
        if (!app.iconUrl)
            return Observable.of(false);

        if (app.iconUrl.startsWith(this.baseLocalIconUrl))
            return Observable.of(true);

        return this.http.get(app.iconUrl)
            .map((res: Response) => (res && res.ok))
            .catch(() => Observable.of(false));
    }
}