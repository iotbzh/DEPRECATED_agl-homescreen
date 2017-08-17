import {Component, OnInit, OnDestroy} from '@angular/core';
import {AglIdentityService} from "../aglIdentity.service";

@Component({
  selector: 'app-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy{
  public account;

  constructor(private aglIdentityService: AglIdentityService) {
  }

  ngOnInit() {
    this.aglIdentityService.loginResponse.subscribe((response: any) => {
      this.account = response.account;
    });
  }

  ngOnDestroy(): void {
    // this.aglIdentityService.loginResponse.unsubscribe();
    // this.aglIdentityService.logoutResponse.unsubscribe();
  }
}
