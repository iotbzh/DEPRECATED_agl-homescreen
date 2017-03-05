import { Component, OnInit, OnDestroy } from "@angular/core";
import { AfmMainService, App } from "../../shared/afmMain.service";
import { AglIdentityService } from "../../shared/aglIdentity.service";
import { environment } from "../../../environments/environment";

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
            this.apps.forEach((elem) => {
                elem.extend = {
                    isPressed: false,
                };

                // Set default icon when icon is not valid / doesn't exist
                this.afmMainService.isIconValid(elem).subscribe(
                    result => {
                        if (!result)
                            this.setDefaultIcon(elem);
                    },
                    error => {
                        console.error('Error=', error);
                        this.setDefaultIcon(elem)
                    }
                );
            });
        });

        this.afmMainService.startOnceResponse.subscribe((response: any) => {
            alert('App is already running');
        });

        this.afmMainService.startAppResponse.subscribe(
            (response: { apps: App[], app: App, res: Object }) => {
                this.apps = response.apps;
                if (response.app.runUri) {
                    // Open app in a new tab
                    let self = this;
                    let app = response.app;
                    if (environment.debug) {
                        console.debug("Open apps: ", response.app.runUri);
                    }
                    let appTab = window.open(response.app.runUri, '_blank');
                    // Let's some time to launch app on target
                    setTimeout(() => {
                        // Check if popup blocker is enabled by verifying the height of the new popup
                        if (!appTab || appTab.outerHeight === 0) {
                            alert("Please disable the popup blocker");
                        } else {
                            appTab.onbeforeunload = () => self.afmMainService.stopApp(app);
                            appTab.onerror = (err) => console.error(err);
                        }
                    }, 3000);   // FIXME: removed hard-coded value
                    if (appTab) {
                        appTab.onerror = (err) => console.error(err);
                    }
                }
            }
        );

        this.afmMainService.stopAppResponse.subscribe(
            (response: { apps: App[], app: App, res: Object }) => this.apps = response.apps
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
            if (response.res.status == 'failed') {

                // FIXME: start in remote mode is only supported for HTML apps
                // Find a way to determine which kind of apps before starting
                if (response.res.info == "can't start")
                    response.res.info = "can't start this app in remote mode"

                this.notifier = {
                    show: true,
                    title: 'ERROR',
                    text: response.res.info + '!' || 'Unknown error !\n' + JSON.stringify(response),
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
        if (app.isRunning)
            this.afmMainService.stopApp(app);
        else
            this.afmMainService.startApp(app, "remote");
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