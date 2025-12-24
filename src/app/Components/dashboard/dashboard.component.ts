import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductComponent } from '../product-component/product-component';
import { AuthService } from '../../Services/auth.service';
import { SpinnerComponent } from '../spinner/spinner.component';
import { LoadingServiceService } from '../../Services/loading-service.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,ProductComponent,SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private authService:AuthService){}
  loading = inject(LoadingServiceService)
  showConfirmation:boolean = false
  isCollapsed: boolean = false;
  activePage: string = 'home';

  menuItems = [
    { label: 'Home', icon: 'pi pi-home' },
    { label: 'Sales', icon: 'pi pi-shopping-cart' },
    { label: 'Purchase', icon: 'pi pi-credit-card' },
    { label: 'Inventory', icon: 'pi pi-box' },
    { label: 'Finance', icon: 'pi pi-wallet' },
    { label: 'Reports', icon: 'pi pi-chart-line' },
    { label: 'Settings', icon: 'pi pi-cog' }
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  openPage(page: string) {
    this.activePage = page;
  }
  togglePopup(){
    this.showConfirmation =!this.showConfirmation
  }
  logOut(){
  this.loading.show()
  this.authService.logOut();
  setTimeout(() => {
    this.loading.hide()
  }, 2000);
  }
  
  hideConfirmation(){
    this.showConfirmation= false
  }
}
