import {Component, OnInit, OnDestroy} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {AglIdentityService} from "./shared/aglIdentity.service";

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit, OnDestroy {
  private defaultLanguage: string = 'en';

  constructor(private aglIdentityService: AglIdentityService, private translate: TranslateService) {
  }

  ngOnInit() {
    this.translate.addLangs(["en", "fr"]);
    this.translate.setDefaultLang(this.defaultLanguage);

    let browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang.match(/en|fr/) ? browserLang : this.defaultLanguage);

    this.aglIdentityService.loginResponse.subscribe((response: any) => {
      let account = response.account;
      if (account.language === "ENG") {
        this.translate.use('en');
      } else if (account.language === "FRA") {
        this.translate.use('fr');
      }
    });

    this.aglIdentityService.logoutResponse.subscribe(response => {
      this.translate.use(this.defaultLanguage);
    });
  }

  ngOnDestroy(): void {
    // this.aglIdentityService.loginResponse.unsubscribe();
    // this.aglIdentityService.logoutResponse.unsubscribe();
  }
}