import {NgModule} from "@angular/core";
import {HttpModule, Http} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from "ng2-translate";
import {AppComponent, appRoutes, appRouteProviders} from "./index";
import {HeaderComponent, MenubarComponent, InfobarComponent} from "./shared/header.component/index";
import {AppLauncherComponent} from "./app-launcher/app-launcher.component/index";
import {MultimediaComponent} from "./multimedia/multimedia.component/index";
import {HvacComponent} from "./hvac/hvac.component/hvac.component";
import {NavigationComponent} from "./navigation/navigation.component/navigation.component";
import {AuthService} from "./auth/auth.service/auth.service";
import {AuthGuard} from "./auth/auth.service/auth.guard";
import {LocationStrategy, HashLocationStrategy} from "@angular/common";
import {FooterComponent} from "./shared/footer.component/footer.component";
import {ConnectivityComponent} from "./connectivity/connectivity.component/connectivity.component";
import {HomeComponent} from "./home/home.component/home.component";
import {SettingsHomeComponent} from "./settings/settings-home/settings-home.component";
import {SettingsBluetoothComponent} from "./settings/settings-bluetooth/settings-bluetooth.component";
import {SettingsWifiComponent} from "./settings/settings-wifi/settings-wifi.component";
import {SettingsDatetimeComponent} from "./settings/settings-datetime/settings-datetime.component";
import {PopUpComponent} from "./shared/pop-up.component/pop-up.component";
import {EventEmitterComponent} from "./event-emitter/event-emitter.component/event-emitter.component";
import {UserBarComponent} from "./shared/user-bar.component/user-bar.component";
import {WebSocketService} from "./shared/websocket.service";
import {AglIdentityService} from "./shared/aglIdentity.service";
import {AfmMainService} from "./shared/afmMain.service";
import {RemoveAppsPrefixPipe} from './remove-apps-prefix.pipe';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    appRoutes,
    TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
            deps: [Http]
        })
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    PopUpComponent,
    MenubarComponent,
    InfobarComponent,
    AppLauncherComponent,
    MultimediaComponent,
    HvacComponent,
    NavigationComponent,
    ConnectivityComponent,
    HomeComponent,
    SettingsHomeComponent,
    SettingsBluetoothComponent,
    SettingsWifiComponent,
    SettingsDatetimeComponent,
    EventEmitterComponent,
    UserBarComponent,
    RemoveAppsPrefixPipe
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    appRouteProviders,
    AuthGuard,
    AuthService,
    WebSocketService,
    AglIdentityService,
    AfmMainService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {}
}
