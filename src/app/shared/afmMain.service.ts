import { Injectable }              from "@angular/core";
import { Subject }                 from "rxjs/Subject";

import { WebSocketService }        from "./websocket.service";

@Injectable()
export class AfmMainService {

    public startAppResponse : Subject<Object> = new Subject();
    public detailsResponse : Subject<Object> = new Subject();
    public runnablesResponse : Subject<Object> = new Subject();
    public onesResponse : Subject<Object> = new Subject();

    constructor(private webSocketService: WebSocketService){
        let self = this;
        self.webSocketService.start();
        self.webSocketService.message.subscribe( ( response: any ) => {
            switch (response.type) {
                case "runnables":
                    // @todo  afm-main/runnables
                    self.runnablesResponse.next(response.data);
                    break;
                case "start":
                    // @todo afm-main/start
                    self.startAppResponse.next(response.data);
                    break;
                case "once":
                    // @todo afm-main/once
                    self.onesResponse.next(response.data);
                    break;
                default: break;
                }
        } );
    }

    public startApp(app){
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: "afm-main/start",
                id: app.id
            })
        );
    }

    public getRunnables() {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: 'afm-main/runnables'
            })
        );
    }

    public getDetails() {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: 'afm-main/details'
            })
        );
    }
}