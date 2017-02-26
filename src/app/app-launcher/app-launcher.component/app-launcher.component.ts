import { Component, OnInit, OnDestroy } from "@angular/core";
import { AfmMainService, App } from "../../shared/afmMain.service";
import { AglIdentityService } from "../../shared/aglIdentity.service";

interface INotifier {
    show: boolean;
    title?: string;
    text?: string;
    timeout?: number;
}

@Component({
    selector: 'app-launcher',
    templateUrl: 'app-launcher.component.html',
    styleUrls: ['app-launcher.component.css']
})
export class AppLauncherComponent implements OnInit, OnDestroy {
    private apps: App[];
    private account;
    private tmpAccount;
    private hidePopUp: boolean = true;
    private notifier: INotifier = { show: false };

    public token: string;

    constructor(private afmMainService: AfmMainService, private aglIdentityService: AglIdentityService) {
    }

    ngOnInit() {
        this.afmMainService.runnablesResponse.subscribe((response: App[]) => {
            this.apps = response;
            this.apps.forEach((elem) => elem.extend = {
                isPressed: false,
             });
        });

        this.afmMainService.startOnceResponse.subscribe((response: any) => {
            alert('App is already running');
        });

        this.afmMainService.startAppResponse.subscribe(
            (response:{apps:App[], res:Object}) => this.apps = response.apps
        );

        this.aglIdentityService.loginResponse.subscribe((response: any) => {
            if (this.account) {
                this.tmpAccount = response.account;
                this.hidePopUp = false;
            } else {
                this.afmMainService.getRunnables();
            }
        });

        this.aglIdentityService.logoutResponse.subscribe(data => {
            this.account = null;
        });

        /* Request */
        this.afmMainService.requestResponse.subscribe((response: any) => {
            if (response.status == 'failed') {
                this.notifier = {
                    show: true,
                    title: 'ERROR',
                    text: response.info || 'Unknown error !\n' + JSON.stringify(response),
                }
            }
        });

        this.afmMainService.getRunnables();
    }

    ngOnDestroy(): void {
        // this.aglIdentityService.loginResponse.unsubscribe();
        // this.aglIdentityService.logoutResponse.unsubscribe();
    }

    runApp(event, app) {
        this.afmMainService.startApp(app);
    }

    confirmPopup() {
        this.notifier.show = false;
    }

    confirmLogin() {
        this.account = this.tmpAccount;
        this.hidePopUp = true;
    }

    cancelLogin() {
        this.hidePopUp = true;
    }

    setDefaultIcon(app: App) {
        app.iconUrl = "./assets/svg/default-icon-app.svg";
        this.apps = this.afmMainService.update(app.id, app);
    }
}