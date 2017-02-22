import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {
  Http,
  Headers,
  RequestOptions, Response
} from '@angular/http';

import {environment} from '../../../environments/environment';

@Injectable()
export class AuthService {

  private url: string;
  public token: string;
  public username: string;
  public language: string;

  constructor(private http: Http) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;

    this.url = 'http://' + environment.service.ip;
    if (environment.service.port)
        this.url += ':' + environment.service.port;
    this.url += environment.service.api_url;
  }

  public login(username, password): Observable<string> {
    let body = JSON.stringify({username, password});
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    return this.http.post(this.url + '/login', body, options)
        .map((response: Response) => {
          // login successful if there's a jwt token in the response
          let token = response.json() && response.json().token;
          if (token) {
            return token;
          } else {
            // return false to indicate failed login
            return false;
          }
        })
        .catch(this.handleError);
  }

  public logout(): Observable<any> {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    return this.http.get(this.url + '/logout', options)
        .map((response: Response) => {
            return true;
        })
        .catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

}
