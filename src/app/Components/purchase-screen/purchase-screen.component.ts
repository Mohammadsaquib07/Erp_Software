import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface PurchaseInvoice {
  date: string;
  invoiceNo: string;
  supplier: string;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Unpaid';
}

interface KpiCard {
  title: string;
  value: number;
  icon: string;
  accent: string;
}

interface Supplier {
  id: string;
  name: string;
  gst?: string;
  address?: string;
  phone?: string;
  paymentMode?: string;
}

@Component({
  selector: 'app-purchase-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-screen.component.html',
  styleUrls: ['./purchase-screen.component.css']
})
export class PurchaseScreenComponent {
  /** Search text used for filtering invoices in the table */
  searchText = '';
  /** Current active tab: 'purchase' or 'suppliers' */
  currentTab: 'purchase' | 'suppliers' = 'purchase';

  /** Controls the visibility of the New Purchase modal */
  showNewPurchaseModal = false;

  /** Model bound to the new purchase modal fields */
  newPurchase: Partial<PurchaseInvoice & { date: string }> = {
    date: new Date().toISOString().slice(0, 10),
    invoiceNo: '',
    supplier: '',
    totalAmount: 0,
    status: 'Pending'
  };

  /** Supplier management state */
  suppliers: Supplier[] = [];
  showNewSupplierModal = false;
  newSupplier: Partial<Supplier> = { id: '', name: '', gst: '', address: '', phone: '', paymentMode: '' };

  /** KPI card configuration for the top summary section */
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

  /** Sample purchase invoice data shown in the table */
  purchaseInvoices: PurchaseInvoice[] = [
    { date: '2026-06-01', invoiceNo: 'PUR-1001', supplier: 'Fresh Farm Supplies', totalAmount: 18500, status: 'Paid' },
    { date: '2026-06-03', invoiceNo: 'PUR-1002', supplier: 'Blue Leaf Traders', totalAmount: 9200, status: 'Pending' },
    { date: '2026-06-05', invoiceNo: 'PUR-1003', supplier: 'Mallory Wholesale', totalAmount: 13250, status: 'Unpaid' },
    { date: '2026-06-06', invoiceNo: 'PUR-1004', supplier: 'Pure Milk Co.', totalAmount: 7600, status: 'Paid' }
  ];

  /** Returns the invoices filtered by the search text */
  get filteredInvoices(): PurchaseInvoice[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return this.purchaseInvoices;
    }
    return this.purchaseInvoices.filter(invoice =>
      invoice.supplier.toLowerCase().includes(query) ||
      invoice.invoiceNo.toLowerCase().includes(query)
    );
  }

  /** Returns suppliers filtered by search text */
  get filteredSuppliers(): Supplier[] {
    const q = this.searchText.trim().toLowerCase();
    if (!q) return this.suppliers;
    return this.suppliers.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.gst || '').toLowerCase().includes(q)
    );
  }

  /** Dynamic UI labels */
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

  /** Returns the badge CSS class based on payment status */
  getStatusClass(status?: PurchaseInvoice['status']): string {
    const map: Record<string, string> = {
      Paid: 'badge-paid',
      Pending: 'badge-pending',
      Unpaid: 'badge-unpaid'
    };
    return map[status as string] || 'badge-unpaid';
  }

  /** Handles the new purchase entry action */
  addNewPurchase(): void {
    // open modal for new purchase entry
    this.showNewPurchaseModal = true;
  }

  openNewPurchaseModal() {
    this.showNewPurchaseModal = true;
  }

  closeNewPurchaseModal() {
    this.showNewPurchaseModal = false;
    // reset form model
    this.newPurchase = { date: new Date().toISOString().slice(0, 10), invoiceNo: '', supplier: '', totalAmount: 0, status: 'Pending' };
  }

  saveNewPurchase() {
    // basic validation
    if (!this.newPurchase.invoiceNo || !(this.newPurchase.totalAmount! > 0)) {
      // In a real app show a validation message/toast
      return;
    }
    // resolve supplier name when supplier id provided
    let supplierName = '';
    if (this.newPurchase.supplier) {
      const s = this.suppliers.find(x => x.id === this.newPurchase!.supplier);
      supplierName = s ? s.name : (this.newPurchase.supplier as string);
    }
    // add to invoices list
    this.purchaseInvoices = [
      { date: this.newPurchase.date!, invoiceNo: this.newPurchase.invoiceNo!, supplier: supplierName, totalAmount: this.newPurchase.totalAmount!, status: this.newPurchase.status as any },
      ...this.purchaseInvoices
    ];
    this.closeNewPurchaseModal();
  }

  /* Supplier helpers */
  private suppliersKey = 'erp_suppliers_v1';

  loadSuppliers() {
    try {
      const raw = localStorage.getItem(this.suppliersKey);
      this.suppliers = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.suppliers = [];
    }
  }

  saveSuppliers() {
    localStorage.setItem(this.suppliersKey, JSON.stringify(this.suppliers));
  }

  openNewSupplierModal() {
    this.newSupplier = { id: '', name: '', gst: '', address: '', phone: '', paymentMode: '' };
    this.showNewSupplierModal = true;
  }

  onSupplierSelect(value: string) {
    if (value === '__create__') {
      // open supplier creation
      this.openNewSupplierModal();
      // clear selection so modal takes focus
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
    const id = this.newSupplier.id || 'SUP-' + Date.now().toString(36).toUpperCase();
    const supplier: Supplier = {
      id,
      name: this.newSupplier.name!.trim(),
      gst: this.newSupplier.gst || '',
      address: this.newSupplier.address || '',
      phone: this.newSupplier.phone || '',
      paymentMode: this.newSupplier.paymentMode || ''
    };
    this.suppliers = [supplier, ...this.suppliers];
    this.saveSuppliers();
    this.closeNewSupplierModal();
  }

  removeSupplier(id: string) {
    this.suppliers = this.suppliers.filter(s => s.id !== id);
    this.saveSuppliers();
  }

  ngAfterContentInit() {
    // load persisted suppliers on component init
    this.loadSuppliers();
  }

  /** Handles the invoice view action */
  viewInvoice(invoiceNo: string): void {
    console.log('View invoice:', invoiceNo);
  }

  /** Handles the invoice delete action */
  deleteInvoice(invoiceNo: string): void {
    console.log('Delete invoice:', invoiceNo);
  }
}
