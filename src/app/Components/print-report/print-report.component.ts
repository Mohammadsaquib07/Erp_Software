import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../Services/dashboard.service';
import { RecentOrdersService } from '../../Services/RecentOrderService/recent-orders.service';
import { ItemService } from '../../Services/item.service';
import { DashboardCardsDto } from '../../Model/DashboardCardsDto';
import { RecentOrderDto } from '../../../Types/RecentOrderDto';
import { Product } from '../../Services/item.service';

@Component({
  selector: 'app-print-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './print-report.component.html',
  styleUrls: ['./print-report.component.css']
})
export class PrintReportComponent implements OnInit {
  @Input() reportMode: 'sales' | 'inventory' = 'sales';
  @Output() closeReport = new EventEmitter<void>();
  
  private dashboardService = inject(DashboardService);
  private recentOrderService = inject(RecentOrdersService);
  private itemService = inject(ItemService);

  dashboardData: DashboardCardsDto | null = null;
  recentOrders: RecentOrderDto[] = [];
  productList: Product[] = [];
  reportGeneratedDate: Date = new Date();
  
  selectedReportType: 'sales' = 'sales';
  dateRangeFrom: string = '';
  dateRangeTo: string = '';

  ngOnInit(): void {
    this.loadReportData();
    this.initializeDateRange();
  }

  initializeDateRange(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    this.dateRangeTo = today.toISOString().split('T')[0];
    this.dateRangeFrom = thirtyDaysAgo.toISOString().split('T')[0];
  }

  loadReportData(): void {
    this.dashboardService.getTopCardData().subscribe({
      next: (data) => this.dashboardData = data,
      error: (err) => console.error('Error loading dashboard data:', err)
    });

    this.recentOrderService.getRecentOrders(20).subscribe({
      next: (data) => this.recentOrders = data,
      error: (err) => console.error('Error loading orders:', err)
    });

    this.itemService.getAllItems().subscribe({
      next: (data) => this.productList = data,
      error: (err) => console.error('Error loading products:', err)
    });
  }

  generateReport(): void {
    this.loadReportData();
  }

  printReport(): void {
    window.print();
  }

  exportToPDF(): void {
    alert('Use your browser\'s print dialog (Ctrl+P or Cmd+P) to save as PDF');
    this.printReport();
  }

  close(): void {
    this.closeReport.emit();
  }

  getTotalRevenue(): number {
    return this.recentOrders.reduce((sum, order) => sum + order.amount, 0);
  }

  getTopProducts(): Product[] {
    return this.productList.slice(0, 5).sort((a, b) => b.stock - a.stock);
  }

  getLowStockProducts(): Product[] {
    return this.productList.filter(p => p.stock < 10);
  }

  getCompletedOrders(): number {
    return this.recentOrders.filter(o => o.status?.toLowerCase() === 'completed').length;
  }

  getPendingOrders(): number {
    return this.recentOrders.filter(o => o.status?.toLowerCase() === 'pending').length;
  }

  getInStockProducts(): number {
    return this.productList.filter(p => p.stock > 0).length;
  }
}
