import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

const apiUrl = environment.apiUrl;
@Component({
  selector: 'userprofile',
  templateUrl: './userprofile.component.html'
})
export class UserprofileComponent implements OnInit {
  currentUser: any;

  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  passwordsMatch: boolean = true;
  passwordInvalid: boolean = false;
  fullname: any;
  mobile: any;
  email: any;
  address: any;
  username: any;
  position: any;

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.fullname = this.currentUser.fullname
    this.email = this.currentUser.email
    this.position = this.currentUser.position
    this.username = this.currentUser.username
  }

  validatePasswordsMatch() {
    this.passwordsMatch = this.newPassword === this.confirmNewPassword
  }
  validatePasswords() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    this.passwordInvalid = !passwordRegex.test(this.newPassword);
    this.validatePasswordsMatch()
  }

  changePassword(): void {
    if (this.newPassword === this.oldPassword) {
      Swal.fire({
        icon: "error",
        title: "Users",
        text: "The new password should differ from the old Password!",
      });
      return;
    }
    if (this.passwordsMatch && !this.passwordInvalid) {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      this.http.post<any>(`${apiUrl}/User/changepassword/${this.authService.currentUser.userId}`, { 'OldPassword': this.oldPassword, 'NewPassword': this.newPassword }, { headers }).subscribe(
        (response) => {
          this.newPassword = ""
          this.oldPassword = ""
          this.confirmNewPassword = ""
          Swal.fire({
            icon: "success",
            title: "Users",
            text: "Password Changed Successfully",
          });
        },
        (error) => {

          Swal.fire({
            icon: "error",
            title: "Users",
            text: `${error.error}`,
          });
        }
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Users",
        text: "Validation error!",
      });
    }
  }
}
