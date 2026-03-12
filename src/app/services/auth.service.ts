import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignIn } from '../components/login/login.component';
import { environment } from '../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { LastActivePageService } from './last-active-page.service';

export interface IUser {
  userId: number;
  staffId: number;
  username: string;
  email: string;
  fullname: string;
  position: string;
  mainmenu: any[];
  submenu: any[];
  permissions: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router: Router = new Router();
  apiUrl = environment.apiUrl;
  helper = new JwtHelperService();

  currentUser: IUser = {
    userId: 0,
    staffId: 0,
    username: '',
    email: '',
    fullname: '',
    position: '',
    mainmenu: [],
    submenu: [],
    permissions: []
  };

  constructor(private http: HttpClient,private lastActivePageService: LastActivePageService) { }

  login(signIn: SignIn) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/User/signin`, signIn, { headers });
  }

  setUserData(token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const decodedToken = this.helper.decodeToken(token);
      this.currentUser.username = decodedToken.unique_name;
      this.currentUser.email = decodedToken.email;
      this.currentUser.fullname = decodedToken.given_name;
      this.currentUser.position = decodedToken.role;
      this.currentUser.userId = decodedToken.nameid;
      this.currentUser.staffId = decodedToken.staffId;
      this.getPermissions();
console.log(decodedToken);
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  getPermissions(): void {
    this.http.get(`${this.apiUrl}/Permissions/${this.currentUser.userId}`)
      .subscribe(
        (response: any) => {

          this.currentUser.mainmenu = response.menuItemIds;
          this.currentUser.submenu = response.subMenuItemIds;
          this.currentUser.permissions = response.commandIds.map((item: { name: any; }) => item.name);
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        },
        (error) => {
          console.error("Error occurred:", error);
        }
      );
  }

  logout(): void {
    if (localStorage.getItem('authToken')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
    this.currentUser = {
      userId: 0,
      staffId: 0,
      username: '',
      email: '',
      fullname: '',
      position: '',
      mainmenu: [],
      submenu: [],
      permissions: []
    };
    this.router.navigate(['']);
  }
}
