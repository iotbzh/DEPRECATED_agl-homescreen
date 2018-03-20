import {Component, OnInit, OnDestroy} from "@angular/core";
import {environment} from "../../../environments/environment";
import {WebSocketHandler} from "../../shared/WebSocketHandler";

@Component({
  selector: 'hvac',
  templateUrl: 'hvac.component.html',
  styleUrls: ['hvac.component.css']
})
export class HvacComponent implements OnInit, OnDestroy, WebSocketHandler {
  private url: string;
  private socket;
  private ws_sub_protos: [ "x-afb-ws-json1" ];
  public leftFront: number = 0;
  public leftRear: number = 0;
  public rightFront: number = 0;
  public rightRear: number = 0;
  public speed: number = 0;
  public mileage: number = 0;

  constructor() {
    this.url = 'ws://' + environment.service.ip;
    if (environment.service.port)
        this.url += ':' + environment.service.port;
    this.url += environment.service.api_url;
  }

  //@todo Add listeners to listen api-methods and implement your logic here
  ngOnInit() {
    /* FIXME: use WebSocketService service instead
    this.socket = new WebSocket(this.url, this.ws_sub_protos);
    this.socket.onopen = this.onWSOpen.bind(this);
    this.socket.onclose = this.onWSClose.bind(this);
    this.socket.onmessage = this.onWSMessageReceive.bind(this);
    */
  }

  ngOnDestroy(){
    if (this.socket) {
        this.socket.send(JSON.stringify(['hvac_chan', 0, 'hvac/off', null]));
        this.socket.close();
    }
  }

  onWSOpen(): void {
    console.log("HVAC websocket is open");
    this.socket.send(JSON.stringify(['hvac_chan', 0, 'hvac/on', null]));
  }

  onWSClose(): void {
    console.log("HVAC websocket is closed");
  }

  onWSMessageReceive(res): void {
    let data = JSON.parse(res.data);
    let response = data[2].response;

    switch (response.type) {
      case "speed-change":
        this.speed = response.value;
        break;
      case "mileage-change":
        this.mileage = response.value;
        break;
      case "left-front-change":
        this.leftFront = response.value;
        break;
      case "left-rear-change":
        this.leftRear = response.value;
        break;
      case "right-front-change":
        this.rightFront = response.value;
        break;
      case "right-rear-change":
        this.rightRear = response.value;
        break;
      default:
        throw new Error("Unknown response type");
    }
  }
}
