import {Component, OnInit} from "@angular/core";
import {AuthService} from "../auth/auth.service/index";
import {Router, NavigationEnd} from "@angular/router";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css'],
  providers: [AuthService],
})
export class LoginComponent implements OnInit {

  public username: string;
  public password: string;

  constructor(private authService: AuthService, private router: Router, private translate: TranslateService) {
    translate.setDefaultLang('en');
  }

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        switch (event.url) {
          case '/logout':
            this.logout();
            break;
          default:
            break;
        }
      }
    });
  }

  login(username, password) {
    // var _this: any = this;
    this.authService.login(username, password)
        .subscribe(
            (res) => {
              localStorage.setItem('currentUser', JSON.stringify({username: username, jwt: res}));
              this.router.navigate(['/home']);
            },
            (err) => console.log(err)
        );
  }

  logout() {
    this.authService.logout()
        .subscribe(
            (res) => {
              localStorage.removeItem('currentUser');
              this.router.navigate(['/login']);
            },
            (err) => console.log(err)
        );
  }
}
