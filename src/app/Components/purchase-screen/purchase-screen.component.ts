import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierServiceService } from '../../Services/supplier-service.service';
import { PurchaseServiceService } from '../../Services/PurchaseService/purchase-service.service';
import { PurchaseInvoiceApi } from '../../Model/Purchase_Model';

interface PurchaseInvoice {
  id?: number;
  invoiceDate: string;
  invoiceNumber: string;
  supplierName: string;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Unpaid';
}

interface KpiCard {
  title: string;
  value: number;
  icon: string;
  accent: string;
}

export interface Supplier {
  id: number;
  name: string;
  gstNumber?: string;
  address?: string;
  phone?: string;
  paymentMode?: string;
}
interface PurchaseInvoice {
  id?: number;
  invoiceDate: string;
  invoiceNumber: string;
  supplierName: string;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Unpaid';
}
@Component({
  selector: 'app-purchase-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-screen.component.html',
  styleUrls: ['./purchase-screen.component.css']
})
export class PurchaseScreenComponent implements OnInit {
  loadingInvoices = false;
  invoiceError = '';
  searchText = '';
  currentTab: 'purchase' | 'suppliers' = 'purchase';
  showNewPurchaseModal = false;

  

  /** New purchase form model — modal ke fields yahi se bindhte hain */
  newPurchase: {
    date: string;
    invoiceNo: string;
    supplier: string;
    totalAmount: number;
    status: 'Paid' | 'Pending' | 'Unpaid';
  } = {
    date: new Date().toISOString().slice(0, 10),
    invoiceNo: '',
    supplier: '',
    totalAmount: 0,
    status: 'Pending'
  };

  suppliers: Supplier[] = [];
  showNewSupplierModal = false;
  loadingSuppliers = false;
  supplierError = '';
  newSupplier: Partial<Supplier> = {
    name: '',
    gstNumber: '',
    address: '',
    phone: '',
    paymentMode: ''
  };

  kpiCards: KpiCard[] = [
    {
      title: 'Total Purchases (This Month)',
      value: 128,
      icon: 'pi pi-credit-card',
      accent: 'card-accent-blue'
    },
    {
      title: 'Pending Orders',
      value: 6,
      icon: 'pi pi-clock',
      accent: 'card-accent-yellow'
    },
    {
      title: 'To Be Paid (Unpaid Bills)',
      value: 4,
      icon: 'pi pi-wallet',
      accent: 'card-accent-red'
    }
  ];

  purchaseInvoices: PurchaseInvoice[] = [];

  constructor(
    private supplierService: SupplierServiceService,
    private purchaseObj: PurchaseServiceService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadInvoices();
  }

  get filteredInvoices(): PurchaseInvoice[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return this.purchaseInvoices;
    }
    return this.purchaseInvoices.filter(invoice =>
      invoice.supplierName.toLowerCase().includes(query) ||
      invoice.invoiceNumber.toLowerCase().includes(query)
    );
  }

  get filteredSuppliers(): Supplier[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return this.suppliers;
    return this.suppliers.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.gstNumber || '').toLowerCase().includes(q)
    );
  }

  get searchPlaceholder(): string {
    return this.currentTab === 'purchase' ? 'Search purchases...' : 'Search suppliers...';
  }

  get actionButtonLabel(): string {
    return this.currentTab === 'purchase' ? 'New Purchase' : 'Create Supplier';
  }

  onActionClick() {
    if (this.currentTab === 'purchase') this.openNewPurchaseModal();
    else this.openNewSupplierModal();
  }

  switchTab(tab: 'purchase' | 'suppliers') {
    this.currentTab = tab;
    this.searchText = '';
  }

  getStatusClass(status?: PurchaseInvoice['status']): string {
    const map: Record<string, string> = {
      Paid: 'badge-paid',
      Pending: 'badge-pending',
      Unpaid: 'badge-unpaid'
    };
    return map[status as string] || 'badge-unpaid';
  }

  openNewPurchaseModal() {
    this.showNewPurchaseModal = true;
  }

  closeNewPurchaseModal() {
    this.showNewPurchaseModal = false;
    this.newPurchase = {
      date: new Date().toISOString().slice(0, 10),
      invoiceNo: '',
      supplier: '',
      totalAmount: 0,
      status: 'Pending'
    };
  }

  /** Backend se seedha flat shape aata hai, koi mapping ki zarurat nahi */
  loadInvoices() {
    this.loadingInvoices = true;
  this.invoiceError = '';
  this.purchaseObj.getAllInvoices().subscribe({
    next: (data: PurchaseInvoiceApi[]) => {
      this.purchaseInvoices = data;
      this.loadingInvoices = false;
    },
    error: (err) => {
      this.invoiceError = 'Purchase invoices load nahi hue: ' + err.message;
      this.loadingInvoices = false;
    }
  });
  }

  saveNewPurchase() {
    if (!this.newPurchase.invoiceNo || !(this.newPurchase.totalAmount > 0)) {
    return;
  }
  let supplierName = '';
  if (this.newPurchase.supplier) {
    const selectedId = +this.newPurchase.supplier;
    const s = this.suppliers.find(x => x.id === selectedId);
    supplierName = s ? s.name : this.newPurchase.supplier;
  }
  const newInvoice: PurchaseInvoice = {
    invoiceDate: this.newPurchase.date,        
    invoiceNumber: this.newPurchase.invoiceNo, 
    supplierName: supplierName,              
    totalAmount: this.newPurchase.totalAmount,
    status: this.newPurchase.status
  };
  this.purchaseInvoices = [newInvoice, ...this.purchaseInvoices];
  this.closeNewPurchaseModal();
  }

  loadSuppliers() {
    this.loadingSuppliers = true;
    this.supplierError = '';
    this.supplierService.getAllSUpplier().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loadingSuppliers = false;
      },
      error: (err) => {
        this.supplierError = 'Suppliers load nahi hue: ' + err.message;
        this.loadingSuppliers = false;
      }
    });
  }

  openNewSupplierModal() {
    this.newSupplier = { name: '', gstNumber: '', address: '', phone: '', paymentMode: '' };
    this.showNewSupplierModal = true;
  }

  onSupplierSelect(value: string) {
    if (value === '__create__') {
      this.openNewSupplierModal();
      this.newPurchase.supplier = '';
      return;
    }
    this.newPurchase.supplier = value;
  }

  closeNewSupplierModal() {
    this.showNewSupplierModal = false;
  }

  addSupplier() {
    if (!this.newSupplier.name || !this.newSupplier.phone) return;

    this.supplierService.createSupplier(this.newSupplier as Supplier).subscribe({
      next: (created) => {
        this.suppliers = [created, ...this.suppliers];
        this.closeNewSupplierModal();
      },
      error: (err) => {
        this.supplierError = 'Supplier create nahi hua: ' + err.message;
      }
    });
  }

  removeSupplier(id: number) {
    this.suppliers = this.suppliers.filter(s => s.id !== id);
  }

  viewInvoice(invoiceNumber: string): void {
    console.log('View invoice:', invoiceNumber);
  }

  deleteInvoice(invoiceNumber: string): void {
    console.log('Delete invoice:', invoiceNumber);
  }
}