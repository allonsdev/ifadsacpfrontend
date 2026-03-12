import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Router, NavigationExtras } from '@angular/router';
import { LastActivePageService } from 'src/app/services/last-active-page.service';

export class SignIn {
  username: string = '';
  password: string = '';
}

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

export class LoginComponent {
  signIn: SignIn = new SignIn();
  loginForm!: FormGroup; // Create a FormGroup

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router,private lastActivePageService: LastActivePageService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.signIn.username = this.loginForm.get('username')?.value;
      this.signIn.password = this.loginForm.get('password')?.value;
      if (localStorage.getItem('authToken')) {
        localStorage.removeItem('authToken');
      }

      // Show loading spinner
      Swal.fire({
        title: 'Signing in...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      } as SweetAlertOptions);

      this.authService.login(this.signIn).subscribe(
        async (response) => {
          localStorage.setItem('authToken', response.token);
          await this.authService.setUserData(response.token);

          // Close loading spinner
          Swal.close();

          const navigationExtras: NavigationExtras = {
            replaceUrl: true
          };

          const lastActivePage =  this.lastActivePageService.getLastActivePage();
            if (lastActivePage) { 
                this.router.navigateByUrl(lastActivePage); 
            } else { 
              this.router.navigate(['home'], navigationExtras);
            } 

        },
        (error) => {
          // Close loading spinner on error
          Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'Login',
            text: `${error.error && error.error}`,
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login',
        text: 'Validation error while signing in.',
      });
    }
  }

}
