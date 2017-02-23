import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from "rxjs";

@Component({
    selector: 'pop-up',
    templateUrl: 'pop-up.component.html',
    styleUrls: ['pop-up.component.css']
})

export class PopUpComponent implements OnInit {
    @Input("title") title: string;
    @Input("text") text: string;
    @Input("timeout") givenTime: number;
    @Input("showTimeout") showTimeout: string;
    @Input("cancelButton") cancelButton: string;

    @Output() onConfirm = new EventEmitter();
    @Output() onCancel = new EventEmitter();

    private timeLeft: number = this.givenTime;

    constructor() {
    }

    ngOnInit() {
        if (this.givenTime > 0) {
            this.givenTime *= 1000;     // timeout input parameter in seconds
            let timer = Observable.timer(this.givenTime);
            let timerSub = timer.subscribe(t => {
                if (this.cancelButton)
                    this.cancel();
                else
                    this.confirm();
                timerSub.unsubscribe();
            });

            let timeLeftTimer = Observable.timer(0, 1000);
            let timerLeftSub = timeLeftTimer.subscribe(t => {
                this.timeLeft = (this.givenTime - t * 1000) / 1000;
                if (this.timeLeft === 0) {
                    timerLeftSub.unsubscribe();
                }
            });
        }
    }

    cancel() {
        this.onCancel.emit();
    }

    confirm() {
        this.onConfirm.emit();
    }
}