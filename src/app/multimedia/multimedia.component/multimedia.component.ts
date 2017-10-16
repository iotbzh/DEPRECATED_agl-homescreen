import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'multimedia',
  templateUrl: 'multimedia.component.html',
  styleUrls: ['multimedia.component.css']
})
export class MultimediaComponent implements OnInit {
  url = 'http://localhost:8000/assets/webgl2examples/dof.html'
  constructor() {}
  ngOnInit() {}
}