import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import Swal, { SweetAlertOptions } from 'sweetalert2';

const apiUrl = environment.apiUrl;

export class User {
  staffMemberId: number = 0;
  username: string = '';
  password: string = '';
}

@Component({
  selector: 'usersmodal',
  templateUrl: './usersmodal.element.html',
})
export class UsersmodalElement implements OnInit {
  currentUser: any;
  users: any;
  user: User = new User();
  staffmembers: any;

  @Output() refresh: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    var data = localStorage.getItem('currentUser');
    this.currentUser = data ? JSON.parse(data) : null;
    this.getAllParameters();
  }
  refreshdata() {
    this.refresh.emit();
  }

  createAccount(): void {
    if (this.user.staffMemberId > 0) {
      // Show loading spinner
      const loadingSwalOptions: SweetAlertOptions = {
        title: 'Creating Account...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      };

      Swal.fire(loadingSwalOptions);

      // Make HTTP request
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post<any>(`${apiUrl}/User`, this.user, { headers }).subscribe(
        (response) => {
          // Close loading spinner
          Swal.close();
          this.getAllParameters();
          this.refreshdata();
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Users',
            text: 'User account created Successfully.',
          });
        },
        (error) => {
          // Close loading spinner
          Swal.close();

          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Users',
            text: 'Error while creating account.',
          });
        }
      );
    } else {
      // Show error message when staffMemberId is not selected
      Swal.fire({
        icon: 'error',
        title: 'Users',
        text: 'Please select StaffMember!',
      });
    }
  }

  getAllParameters(): void {
    this.http.get(`${apiUrl}/StaffMember/notusers`).subscribe(
      (response: any) => {
        this.staffmembers = response;
      },
      (error) => {
        console.error('Error occurred:', error);
      }
    );
  }
}
