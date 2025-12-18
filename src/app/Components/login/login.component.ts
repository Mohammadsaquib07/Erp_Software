import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm:FormGroup;
  passwordPattern: string = '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,}$'
  constructor(private fb: FormBuilder) { 
     this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(this.passwordPattern)]]
    });
   }
   get f(){
    return this.loginForm.controls;
   }

  //   onSubmit() {
  //   if (this.loginForm.valid) {
  //     this.authServiceObj.login(this.loginForm.value).subscribe({
  //       next: data => {
  //         alert('Login Successful');
  //         this.router.navigate(['/dashboard'])
  //       },
  //       error: error => {
  //         alert('Login Failed');
  //       }
  //     });
  //   } else {
  //     console.log('Form is invalid!');
  //     this.loginForm.markAllAsTouched();
  //   }
  // }
}