import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const notAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('JWT_TOKEN');
  if(token){
    router.navigate(['/dashboard'])
  }
  return true;
};
