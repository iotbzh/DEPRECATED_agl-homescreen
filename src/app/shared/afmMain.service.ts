import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";

import { WebSocketService, IOpened } from "./websocket.service";
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
    isInstalled?: boolean,
    extend?: any,
}

@Injectable()
export class AfmMainService {
    public connectionState: Subject<IOpened> = new Subject<IOpened>();
    public startAppResponse: Subject<{apps:App[], res:Object}> = new Subject<{apps:App[], res:Object}>();
    public detailsResponse: Subject<Object> = new Subject();
    public runnablesResponse: Subject<App[]> = new Subject<App[]>();
    public startOnceResponse: Subject<Object> = new Subject();
    public eventsResponse: Subject<Object> = new Subject();
    public requestResponse: Subject<Object> = new Subject();

    private apps: Array<App> = [];

    constructor(private webSocketService: WebSocketService,
        private afbContextService: AfbContextService) {

        this.webSocketService.opened.subscribe((state: IOpened) => {
            this.connectionState.next(state);
        });

        this.webSocketService.message.subscribe((response: any) => {
            switch (response.type) {
                case "runnables":
                    if (response.data && response.data.apps && response.data.apps instanceof Array) {
                        // FIXME removed
                        response.data.apps.forEach(m => this._updateApps(m));

                    } else {
                        console.error('Invalid runnables response (not an Array)', response);
                    }
                    this.runnablesResponse.next(this.apps);
                    break;

                case "details":
                    // TODO
                    // this.detailsApp[appId] = response.data;
                    this.detailsResponse.next(response.data);
                    break;

                case "start":
                    let app = response.app;
                    this.apps.filter(r => r.id == app.id)[0].isRunning = app.isRunning;
                    this.startAppResponse.next({apps: this.apps, res: response.data});
                    break;

                case "once":
                    this.startOnceResponse.next(response.data);
                    break;

                case "event":
                    this.eventsResponse.next(response);
                    break;

                case "request":
                    this.requestResponse.next(response.data);
                    break;

                default: break;
            }
        });
    }

    private _updateApps(elem: any): void {
        let app: App = {
            id:             elem.id,
            name:           elem.name,
            shortname:      elem.shortname,
            version:        elem.version,
            author:         elem.author,
            description:    elem.description,
            filename:       '',
            authRequired:   false,
            iconUrl:        'icons/' + elem.id + '?token=' + this.afbContextService.token,
            isRunning:      false,
            isInstalled:    true,
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
        switch(app.name) {
            case 'hvac':
            case 'navigation':
            case 'phone':
            case 'radio':
            case 'multimedia':
            case 'connectivity':
            case 'dashboard':
            case 'settings':
            case 'point':
                app.iconUrl = './assets/svg/' + app.name + '-circle.svg';
            break;
        }

        this.update(app.id, app);
    }

    private _sendMessage(cmd, app?) {
        if (app && !app.id)
            console.error('Invalid app.id');

        let msg = { api: "afm-main/" + cmd };
        if (app)
            msg['id'] = app.id;

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

    public startApp(app) {
        this._sendMessage('once', app);
    }

    public getRunnables(forceRefresh?: boolean) {
        let frRsh = forceRefresh || false
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
}