import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'barchart',
  templateUrl: './barchart.element.html'
})

export class BarchartElement implements OnInit {
  currentUser: any;

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    throw new Error('Method not implemented.');
  }

}
