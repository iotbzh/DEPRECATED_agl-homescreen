import { Component, OnInit } from '@angular/core';

import { environment } from "../../../environments/environment";

@Component({
    selector: 'multimedia',
    templateUrl: 'multimedia.component.html',
    styleUrls: ['multimedia.component.css']
})
export class MultimediaComponent implements OnInit {
    public url: string;

    constructor() {
        let env = environment.service || {
            ip: 'localhost',
            port: null,
            api_url: '/api'
        };
        this.url = 'http://' + env.ip;
        if (env.port) {
            this.url += ':' + env.port;
        }
        this.url += '/assets/webgl2examples/dof.html';
    }

    ngOnInit() { }
}
