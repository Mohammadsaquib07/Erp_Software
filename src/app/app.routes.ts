import { Routes } from '@angular/router';
import { authGuard } from './Guard/auth.guard';
import { notAuthGuard } from './Guard/not-auth.guard';
export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },

    {
        canActivate:[notAuthGuard],
        path: '',
        loadComponent: () => import('./Components/login/login.component').then(m => m.LoginComponent)
    },
    {
        canActivate:[authGuard],
        path: 'dashboard',
        loadComponent: () => import('./Components/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        canActivate:[authGuard],
        path: 'sales/invoice',
        loadComponent: () => import('./Components/product-component/product-component').then(m => m.ProductComponent)
    }
];
