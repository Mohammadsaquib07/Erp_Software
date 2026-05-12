import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { SpinnerComponent } from '../spinner/spinner.component';
import { LoadingServiceService } from '../../Services/loading-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm:FormGroup;
  private loading = inject(LoadingServiceService)
  passwordPattern: string = '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$'
  showPassword: boolean = false;
  errorMessage: string = '';
  constructor(private fb: FormBuilder,private authServiceObj:AuthService,private router:Router) { 
     this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(this.passwordPattern)]]
    });
   }
   get f(){
    return this.loginForm.controls;
   }
   togglePasswordVisibility() {
     this.showPassword = !this.showPassword;
   }
    onSubmit() {
    if (this.loginForm.valid) {
      this.loading.show()
      alert('called')
      this.authServiceObj.login(this.loginForm.value).subscribe({
        next: data => {
          this.router.navigate(['/dashboard'])
        },
        error: error => {
          this.errorMessage = 'Login Failed: Invalid credentials';
          this.loading.hide();
        }
      });
    } else {
      console.log('Form is invalid!');
      this.loginForm.markAllAsTouched();
     }
    }
}