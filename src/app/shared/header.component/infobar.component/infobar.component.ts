import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'infobar',
  templateUrl: 'infobar.component.html',
  styleUrls: ['infobar.component.css']
})
export class InfobarComponent implements OnInit {
  public connections = [
    {isOn: true},
    {isOn: false},
    {isOn: true}
  ];
  public now: Date = new Date();

  constructor() {}

  ngOnInit() {
    setInterval(() => {
      this.now =  new Date();
    }, 1000);
  }

  toogleConnection(event, connection) {
    connection.isOn = !connection.isOn;
  }
}
