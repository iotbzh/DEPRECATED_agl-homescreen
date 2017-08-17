import { Component, OnInit, OnDestroy } from "@angular/core";
import { AfmMainService, App } from "../../shared/afmMain.service";
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
    public apps: App[];
    public account;
    private tmpAccount;
    public uploader: FileUploader;
    public acceptFile //TODO Check
    public notifier: INotifier = { show: false };
    public hidePopUpLogin: boolean = true;
    private afCtx: AfbContextService;

    constructor(private afmMainService: AfmMainService,
        private aglIdentityService: AglIdentityService,
        private AfbContextService: AfbContextService) {

        this.afCtx = AfbContextService;
        this.uploader = new FileUploader({ url: '/notSet' });
        this.uploader.onAfterAddingAll = this._onAfterAddingAll.bind(this);
        this.uploader.onProgressItem = this._upLoad_onProgressItem.bind(this);
        this.uploader.onErrorItem = this._upLoad_onErrorItem.bind(this);
        this.uploader.onCompleteItem = this._upLoad_onCompleteItem.bind(this);
    }

    ngOnInit() {
        /* Connection */
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

        /* runnablesResponse */
        this.afmMainService.runnablesResponse.subscribe((response: App[]) => {
            this.apps = response;
            this.apps.forEach((elem) => elem.extend = {
                installProgress: -1
            })
        });

        /* Start once */
        this.afmMainService.startOnceResponse.subscribe((response: any) => {
            this.notifier = {
                show: true,
                title: 'ERROR',
                text: 'App is already running',
                timeout: 10
            }
        });

        /* Event */
        this.afmMainService.eventsResponse.subscribe((response: any) => {
            if (response.event == "application-list-changed")
                this.afmMainService.getRunnables(true);
        });

        /* Request */
        this.afmMainService.requestResponse.subscribe((response: any) => {
            if (response.res.status == 'failed') {
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

    uninstallApp(app: App): void {
        this.afmMainService.deleteApp(app);
    }

    installApp(app: App): void {
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
            app.extend.installProgress = 0;
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
            let name = el.file.name.replace(/\.wgt$/g, '');
            this.afmMainService.addNewApp({
                id: 'TEMPO_' + name,
                name: name,
                shortname: name,
                version: null,
                author: null,
                description: null,
                filename: el.file.name,
                isInstalled: false,
                extend: { installProgress: -1 }
            });
        });
    }

    /*private*/ _upLoad_onProgressItem(fileItem: FileItem, progress: any): any {
        this.apps.forEach(el => {
            if (el.filename == fileItem.file.name)
                el.extend.installProgress = progress;
        });
    }

    /*private*/ _upLoad_onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        // TODO
        console.error('_onErrorItem item', item, response, status);
    }

    /*private*/ _upLoad_onCompleteItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        if (environment.debug)
            console.debug('Upload Complete item', item, response, status);

        if (response) {
            try {
                let res = JSON.parse(response);
                if (res.request && res.request.status == "failed") {
                    this.notifier = {
                        show: true,
                        title: 'UPLOAD ERROR',
                        text: res.request.info || 'Unknown error !\n' + JSON.stringify(res),
                    }
                }
            }
            catch(err) {
                console.error(err);
            }
        }

        // FIXME - hack
        // Remove temporary entry because install widget may have
        // another name than the one determined from filename (see _onAfterAddingAll)
        let idx = this.apps.findIndex((elem) => elem.filename == item.file.name);
        if (idx != -1)
            this.afmMainService.removeApp(this.apps[idx].id);

        this.uploader.removeFromQueue(item);
    }
}