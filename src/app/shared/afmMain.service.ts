import { Injectable }              from "@angular/core";
import { Subject }                 from "rxjs/Subject";

import { WebSocketService, IOpened }       from "./websocket.service";

@Injectable()
export class AfmMainService {
    public connectionState : Subject<IOpened> = new Subject<IOpened>();
    public startAppResponse : Subject<Object> = new Subject();
    public detailsResponse : Subject<Object> = new Subject();
    public runnablesResponse : Subject<Object> = new Subject();
    public onesResponse : Subject<Object> = new Subject();
    public eventsResponse : Subject<Object> = new Subject();
    public requestResponse: Subject<Object> = new Subject();

    constructor(private webSocketService: WebSocketService){

        this.webSocketService.opened.subscribe((state: IOpened) => {
            this.connectionState.next(state);
        });

        this.webSocketService.message.subscribe( ( response: any ) => {
            switch (response.type) {
                case "runnables":
                    this.runnablesResponse.next(response.data);
                    break;
                case "start":
                    this.startAppResponse.next(response.data);
                    break;
                case "once":
                    this.onesResponse.next(response.data);
                    break;
                case "event":
                    this.eventsResponse.next(response);
                    break;
                case "request":
                    this.requestResponse.next(response.data);
                    break;

                default: break;
                }
        } );
    }

    private _sendMessage(cmd, app?) {
        if (app && !app.id)
            console.error('Invalid app.id');

        let msg = {api: "afm-main/" + cmd};
        if (app)
            msg['id'] = app.id;

        this.webSocketService.sendMessage(JSON.stringify(msg));
    }

    public startApp(app)    { this._sendMessage('once', app); }
    public getRunnables()   { this._sendMessage('runnables'); }
    public getDetails()     { this._sendMessage('detail'); }
    public deleteApp(app)   { this._sendMessage('uninstall', app); }

    public get isConnectionUp(): boolean {
        return this.webSocketService.isConnectionUp;
    }

    public restartConnection(resetToken?: boolean): void {
        this.webSocketService.restart(resetToken);
    }
}