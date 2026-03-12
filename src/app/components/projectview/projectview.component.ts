import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from 'src/app/services/auth.service';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'projectview',
  templateUrl: './projectview.component.html'
})
export class ProjectviewComponent implements OnInit {
  name: any;
  position: any;
  currentUser: any;

  constructor(private authService: AuthService) {

  }
  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.name = this.currentUser.fullname
    this.position = this.currentUser.position
  }

  logout() {
    this.authService.logout()
  }

}
