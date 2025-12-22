import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProductComponent } from '../product-component/product-component';
import { AuthService } from '../../Services/auth.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,ProductComponent,SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private authService:AuthService){}
  menuItems = [
    { label: 'Home', icon: 'pi pi-home' },
    { label: 'Sales', icon: 'pi pi-shopping-cart' },
    { label: 'Purchase', icon: 'pi pi-credit-card' },
    { label: 'Inventory', icon: 'pi pi-box' },
    { label: 'Finance', icon: 'pi pi-wallet' },
    { label: 'Reports', icon: 'pi pi-chart-line' },
    { label: 'Settings', icon: 'pi pi-cog' }
  ];
  isCollapsed: boolean = false;
  activePage: string = 'home';
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  openPage(page: string) {
    this.activePage = page;
  }
  logOut(){
  this.authService.logOut();
  }
}
