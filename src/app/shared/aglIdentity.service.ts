import { Injectable }              from "@angular/core";
import { Subject }                 from "rxjs/Subject";

import { WebSocketService, IMessage } from "./websocket.service";

@Injectable()
export class AglIdentityService {

    public logoutResponse : Subject<Object> = new Subject();
    public loginResponse : Subject<Object> = new Subject();

    constructor(private webSocketService: WebSocketService){
        this.webSocketService.message.subscribe( ( response: IMessage ) => {
            switch (response.type) {
                case "logged-in":
                    this.loginResponse.next(response.res);
                    break;
                case "logged-out":
                    // // @todo agl-identity/logout
                    this.logoutResponse.next(response.res);
                    break;
                default: break;
            }
        } );
    }

    public login(name, language){
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: "agl-identity/login",
                data: {
                    username: name,
                    language: language
                }
            })
        );
    }

    public logout(){
        this.webSocketService.sendMessage(JSON.stringify({
            api: "agl-identity/logout",
            data: {
                accountId: 'someAccountId'
            }
        }))
    }

}