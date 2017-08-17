import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if (environment.service.ip == null)
  environment.service.ip = window.location.hostname;
if (environment.service.port == null)
  environment.service.port = window.location.port;

platformBrowserDynamic().bootstrapModule(AppModule);