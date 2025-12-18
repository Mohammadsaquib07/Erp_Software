import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: '',
        loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent)
    }
];
