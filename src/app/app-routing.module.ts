import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AppLauncherComponent} from './app-launcher/app-launcher.component/index';
import {AppManagerComponent} from './app-manager/app-manager.component/index';
import {MultimediaComponent} from './multimedia/multimedia.component/index';
import {HvacComponent} from "./hvac/hvac.component/hvac.component";
import {NavigationComponent} from "./navigation/navigation.component/navigation.component";
import {ConnectivityComponent} from "./connectivity/connectivity.component/connectivity.component";
import {HomeComponent} from "./home/home.component/home.component";
import {SettingsHomeComponent} from "./settings/settings-home/settings-home.component";
import {SettingsBluetoothComponent} from "./settings/settings-bluetooth/settings-bluetooth.component";
import {SettingsWifiComponent} from "./settings/settings-wifi/settings-wifi.component";
import {SettingsDatetimeComponent} from "./settings/settings-datetime/settings-datetime.component";
import {EventEmitterComponent} from "./event-emitter/event-emitter.component/event-emitter.component";

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'app-launcher', component: AppLauncherComponent},
  {path: 'app-manager', component: AppManagerComponent},
  {path: 'multimedia', component: MultimediaComponent},
  {path: 'hvac', component: HvacComponent},
  {path: 'navigation', component: NavigationComponent},
  {path: 'connectivity', component: ConnectivityComponent},
  {
    path: 'settings',
    children: [
      {path: '', component: SettingsHomeComponent},
      {path: 'bluetooth', component: SettingsBluetoothComponent},
      {path: 'wifi', component: SettingsWifiComponent},
      {path: 'datetime', component: SettingsDatetimeComponent}
    ]
  },
  {path: 'event-emitter', component: EventEmitterComponent},
  {path: '**', component: HomeComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
