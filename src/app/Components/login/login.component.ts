import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { LoadingServiceService } from '../../Services/loading-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  private loading = inject(LoadingServiceService);
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authServiceObj: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required]],   // no complexity pattern on login — that's a signup-only rule
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.show();
      this.authServiceObj.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading.hide();
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMessage = 'Login Failed: Invalid credentials';
          this.loading.hide();
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}