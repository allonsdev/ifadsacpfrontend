import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LastActivePageService } from 'src/app/services/last-active-page.service';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  router: Router = new Router();
  name: any;
  position: any;
  currentUser: any;

  constructor(private authService: AuthService,private lastActivePageService: LastActivePageService) {

  }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.name = this.currentUser.fullname
    this.position = this.currentUser.position
  }

  logout() {
    this.authService.logout()
    this.lastActivePageService.clearLastActivePage()
  }
}
