import { Component, OnInit, OnDestroy } from "@angular/core";
import { AfmMainService } from "../../shared/afmMain.service";
import { IOpened } from "../../shared/websocket.service";
import { AglIdentityService } from "../../shared/aglIdentity.service";
import { FileUploader, FileItem, ParsedResponseHeaders } from 'ng2-file-upload';

import { AfbContextService } from "../../shared/afbContext.service";
import { environment } from "../../../environments/environment";

interface INotifier {
    show: boolean;
    title?: string;
    text?: string;
    timeout?: number;
}

@Component({
    selector: 'app-manager',
    templateUrl: 'app-manager.component.html',
    styleUrls: ['app-manager.component.css']
})
export class AppManagerComponent implements OnInit, OnDestroy {
    private runnables;
    private account;
    private tmpAccount;
    public uploader: FileUploader;
    private notifier: INotifier = { show: false };
    private hidePopUpLogin: boolean = true;
    private afCtx: AfbContextService;

    constructor(private afmMainService: AfmMainService, private aglIdentityService: AglIdentityService, private AfbContextService: AfbContextService) {
        this.afCtx = AfbContextService;
        this.uploader = new FileUploader({ url: '/notSet' });
        this.uploader.onAfterAddingAll = this._onAfterAddingAll.bind(this);
        this.uploader.onProgressItem = this._upLoad_onProgressItem.bind(this);
        this.uploader.onErrorItem = this._upLoad_onErrorItem.bind(this);
        this.uploader.onCompleteItem = this._upLoad_onCompleteItem.bind(this);
    }

    ngOnInit() {
        this.afmMainService.connectionState.subscribe((state: IOpened) => {
            if (state.isOpened) {
                this.notifier = { show: false };
                // Force update runnables on connection opening
                this.afmMainService.getRunnables();

            } else {
                this.notifier = {
                    show: true,
                    title: 'CONNECTION ERROR',
                    text: state.error
                }
            }
        });

        this.afmMainService.runnablesResponse.subscribe((response: any) => {
            this.runnables = response.apps;
            if (this.runnables) {
                this.runnables.forEach(el => {
                    el.isInstalled = true;
                    el.isRunning = el.isPressed = false;
                });
            }
        });

        this.afmMainService.onesResponse.subscribe((response: any) => {
            this.notifier = {
                show: true,
                title: 'ERROR',
                text: 'App is already running',
                timeout: 10
            }
        });

        this.afmMainService.eventsResponse.subscribe((response: any) => {
            if (response.event == "application-list-changed")
                this.afmMainService.getRunnables();
        });

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

    uninstallApp(app): void {
        this.afmMainService.deleteApp(app);
    }

    installApp(app): void {
        let url = this.afCtx.getUrl('http', 'afm-main/install');
        this.uploader.queue.forEach((item) => {
            if (app.filename != item.file.name)
                return;

            item.url = url;
            item.alias = 'widget';
            if (environment.debug) {
                console.debug('Upload file: ', item);
                console.debug('Upload url: ', url);
            }
            app.installProgress = 0;
            this.uploader.uploadItem(item);
        });
    }

    confirmPopup() {
        this.notifier.show = false;
    }

    confirmPopupLogin() {
        this.hidePopUpLogin = true;
    }

    cancelPopupLogin() {
        this.hidePopUpLogin = true;
    }

    /*FIXME private property prevent bind(this) ??? */
    _onAfterAddingAll(fileItems: any) {
        fileItems.forEach(el => {
            this.runnables.push({
                name: el.file.name.replace(/\.wgt$/g, ''),
                filename: el.file.name,
                isInstalled: false
            });
        });
    }

    /*private*/ _upLoad_onProgressItem(fileItem: FileItem, progress: any): any {
        this.runnables.forEach(el => {
            if (el.filename == fileItem.file.name)
                el.installProgress = progress;
        });
    }

    /*private*/ _upLoad_onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        // TODO
        console.error('_onErrorItem item', item, response, status);
    }

    /*private*/ _upLoad_onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        if (environment.debug)
            console.debug('Upload Complete item', item, response, status);
        this.uploader.removeFromQueue(item);
    }
}