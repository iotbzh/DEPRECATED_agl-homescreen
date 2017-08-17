import {Component, OnInit, OnDestroy } from "@angular/core";
import {AglIdentityService} from "../../shared/aglIdentity.service";
import { AfmMainService } from "../../shared/afmMain.service";

@Component({
  selector: 'home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public account;
  private tmpAccount;
  public hidePopUpLogin: boolean = true;

  constructor(private aglIdentityService: AglIdentityService,
    public afmMainService: AfmMainService) {
  }

  ngOnInit() {
    this.aglIdentityService.loginResponse.subscribe((response: any) => {
      let account = response.account;
      if (this.account) {
        this.tmpAccount = account;
        this.hidePopUpLogin = false;
      } else {
        this.account = account;
      }
    });
    this.aglIdentityService.logoutResponse.subscribe(response=> {
      this.account = null;
    });
  }

  ngAfterViewInit(): void {
    // Allow to re-open connection manually (by opening this view)
    if (!this.afmMainService.isConnectionUp)
        this.afmMainService.restartConnection(true);
  }

  ngOnDestroy(): void {
    // this.aglIdentityService.loginResponse.unsubscribe();
    // this.aglIdentityService.logoutResponse.unsubscribe();
  }

  confirmLogin() {
    this.account = this.tmpAccount;
    this.hidePopUpLogin = true;
  }

  cancelLogin() {
    this.hidePopUpLogin = true;
  }

}