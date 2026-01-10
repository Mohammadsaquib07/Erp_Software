import { CommonModule } from '@angular/common';
import { Component, inject, AfterViewInit,HostListener } from '@angular/core';
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
export class DashboardComponent implements AfterViewInit {
  constructor(private authService:AuthService){}
  loading = inject(LoadingServiceService)
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
  ngAfterViewInit() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Handle tooltips based on collapsed state
    setTimeout(() => {
      if (this.isCollapsed) {
        // Initialize tooltips when collapsed
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
        });
      } else {
        // Dispose tooltips when expanded
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          const tooltip = (window as any).bootstrap.Tooltip.getInstance(tooltipTriggerEl);
          if (tooltip) {
            tooltip.hide();
            tooltip.dispose();
          }
        });
      }
    }, 100);
  }
  openPage(page: string) {
    this.activePage = page;
  }
  logOut() {
    this.loading.show();
    this.authService.logOut();
    setTimeout(() => {
      this.loading.hide();
    }, 2000);
  }
@HostListener('window:resize',['$event'])

onResize(event:Event){
console.log(window.innerWidth)
}
handleClick(){
    alert('button is clicked')
}
}
