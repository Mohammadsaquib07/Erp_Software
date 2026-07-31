import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SupplierServiceService } from '../../Services/supplier-service.service';
import { PurchaseServiceService } from '../../Services/PurchaseService/purchase-service.service';
import { PurchaseInvoiceApi } from '../../Model/Purchase_Model';
import { ItemService } from '../../Services/item.service';

interface PurchaseInvoice {
  id?: number;
  invoiceDate: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId: string;
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

// ✅ Product master (Items table se aayega — id, name, price, stock)
// imageUrl abhi optional hai — jab backend/DB mein image column add hoga tab automatically use hone lagega
export interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number;
  imageUrl?: string;
}

// ✅ Ek line item row ka shape — modal ke items array ke liye
interface PurchaseLineItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-purchase-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './purchase-screen.component.html',
  styleUrls: ['./purchase-screen.component.css']
})
export class PurchaseScreenComponent implements OnInit {
  isDuplicateInvoice: boolean = false;
  formSubmitted: boolean = false;
  isSaving: boolean = false;
  showSuccessToast: boolean = false;
  loadingInvoices = false;
  invoiceError = '';
  searchText = '';
  currentTab: 'purchase' | 'suppliers' = 'purchase';
  showNewPurchaseModal = false;

  /** New purchase form model — modal ke fields yahi se bindhte hain */
  newPurchase: {
    date: string;
    dueDate: string;
    invoiceNo: string;
    supplier: string;
    totalAmount: number;
    status: 'Paid' | 'Pending' | 'Unpaid';
    items: PurchaseLineItem[];
  } = {
    date: new Date().toISOString().slice(0, 10),
    dueDate: '',
    invoiceNo: '',
    supplier: '',
    totalAmount: 0,
    status: 'Pending',
    items: [this.createEmptyLineItem()]
  };

  suppliers: Supplier[] = [];
  showNewSupplierModal = false;
  loadingSuppliers = false;
  supplierError = '';
  supplierFormSubmitted = false;
  isDuplicateSupplierPhone = false;
  isSavingSupplier = false;
  newSupplier: Partial<Supplier> = {
    name: '',
    gstNumber: '',
    address: '',
    phone: '',
    paymentMode: ''
  };

  // ✅ Products master list — searchable dropdown ke liye
  products: Product[] = [];
  loadingProducts = false;
  productError = '';

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
    private purchaseObj: PurchaseServiceService,
    private productService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadInvoices();
    this.loadProducts();
  }

  // ==============================
  // GETTERS
  // ==============================

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

  // ✅ Line items valid hain ya nahi — har row mein product, qty>0, price>0 hona chahiye
  get lineItemsInvalid(): boolean {
    return this.newPurchase.items.length === 0 ||
      this.newPurchase.items.some(item =>
        !item.productId || item.quantity <= 0 || item.unitPrice <= 0
      );
  }

  // ==============================
  // TAB / ACTION HANDLERS
  // ==============================

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

  // ==============================
  // PURCHASE MODAL
  // ==============================

  openNewPurchaseModal() {
    this.showNewPurchaseModal = true;
    this.formSubmitted = false;
    this.isDuplicateInvoice = false;
  }

  closeNewPurchaseModal() {
    this.showNewPurchaseModal = false;
    this.formSubmitted = false;
    this.isDuplicateInvoice = false;
    this.newPurchase = {
      date: new Date().toISOString().slice(0, 10),
      dueDate: '',
      invoiceNo: '',
      supplier: '',
      totalAmount: 0,
      status: 'Pending',
      items: [this.createEmptyLineItem()]
    };
  }

  private createEmptyLineItem(): PurchaseLineItem {
    return { productId: 0, quantity: 1, unitPrice: 0 };
  }

  // ✅ Naya line item row add karo
  addItemRow() {
    this.newPurchase.items.push(this.createEmptyLineItem());
  }

  // ✅ Row remove karo (kam se kam 1 row rehni chahiye)
  removeItemRow(index: number) {
    if (this.newPurchase.items.length === 1) return;
    this.newPurchase.items.splice(index, 1);
    this.recalculateTotal();
  }

  // ✅ Product select hote hi uska price suggestion ke taur pe unit price mein fill karo
  onProductSelect(index: number) {
    const item = this.newPurchase.items[index];
    const product = this.products.find(p => p.id === +item.productId);
    if (product) {
      item.unitPrice = product.price;
    }
    this.recalculateTotal();
  }

  // ✅ Product thumbnail image load fail ho (broken URL / 404) to fallback icon dikhao
  onProductImageError(event: Event) {
    const imgEl = event.target as HTMLImageElement;
    // Broken <img> ko chhupa do — HTML mein *ngIf="!item.imageUrl" wala placeholder icon
    // already exist karta hai, is element ko hide karke wahi dikhne dete hain
    imgEl.style.display = 'none';
  }

  // ✅ Total Amount ko sab line items ke sum se auto-calculate karo
  recalculateTotal() {
    this.newPurchase.totalAmount = this.newPurchase.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }

  // ==============================
  // DATA LOADING
  // ==============================

  loadInvoices() {
    this.loadingInvoices = true;
    this.invoiceError = '';
    this.purchaseObj.getAllInvoices().subscribe({
      next: (data: PurchaseInvoiceApi[]) => {
        this.purchaseInvoices = data as unknown as PurchaseInvoice[];
        this.loadingInvoices = false;
      },
      error: (err) => {
        this.invoiceError = 'Purchase invoices load nahi hue: ' + err.message;
        this.loadingInvoices = false;
      }
    });
  }

  // ✅ Products master list load karo (searchable dropdown ke liye)
  loadProducts() {
    this.loadingProducts = true;
    this.productError = '';
    this.productService.getAllItems().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.loadingProducts = false;
      },
      error: (err) => {
        this.productError = 'Products load nahi hue: ' + err.message;
        this.loadingProducts = false;
      }
    });
  }

  // ==============================
  // VALIDATION
  // ==============================

  checkDuplicateInvoice() {
    if (!this.newPurchase.invoiceNo || !this.newPurchase.supplier) {
      this.isDuplicateInvoice = false;
      return;
    }

    this.isDuplicateInvoice = this.purchaseInvoices.some(
      inv => inv.invoiceNumber.trim().toLowerCase() === this.newPurchase.invoiceNo.trim().toLowerCase() &&
             String(inv.supplierId) === String(this.newPurchase.supplier)
    );
  }

  isFormValid(): boolean {
    return !!this.newPurchase.supplier &&
           !!this.newPurchase.invoiceNo &&
           !!this.newPurchase.date &&
           !this.lineItemsInvalid &&
           !this.isDuplicateInvoice;
  }

  // ==============================
  // SAVE PURCHASE
  // ==============================

  saveNewPurchase() {
    this.formSubmitted = true;
    this.checkDuplicateInvoice();
    this.recalculateTotal();

    if (!this.isFormValid()) {
      return;
    }

    const supplierIdNum = +this.newPurchase.supplier;
    const s = this.suppliers.find(x => x.id === supplierIdNum);
    const supplierName = s ? s.name : '';

    // ✅ Backend POST API structure ke hisaab se payload banaya
    // { supplierId, invoiceNumber, invoiceDate, dueDate, status, items: [{productId, quantity, unitPrice}] }
    const apiPayload = {
      supplierId: supplierIdNum,
      invoiceNumber: this.newPurchase.invoiceNo,
      invoiceDate: this.newPurchase.date,
      dueDate: this.newPurchase.dueDate || null,
      status: this.newPurchase.status,
      items: this.newPurchase.items.map(item => ({
        productId: +item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))
    };

    this.isSaving = true;

    this.purchaseObj.createInvoice(apiPayload).subscribe({
      next: () => {
        // Local list mein bhi turant reflect karwa do (optimistic update)
        const newInvoice: PurchaseInvoice = {
          invoiceDate: this.newPurchase.date,
          invoiceNumber: this.newPurchase.invoiceNo,
          supplierName: supplierName,
          supplierId: this.newPurchase.supplier,
          totalAmount: this.newPurchase.totalAmount,
          status: this.newPurchase.status
        };
        this.purchaseInvoices = [newInvoice, ...this.purchaseInvoices];

        this.isSaving = false;
        this.showSuccessToast = true;
        this.closeNewPurchaseModal();
        setTimeout(() => (this.showSuccessToast = false), 3000);
      },
      error: (err) => {
        this.isSaving = false;
        this.invoiceError = 'Purchase save nahi hua: ' + err.message;
      }
    });
  }

  // ==============================
  // SUPPLIERS
  // ==============================

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
    this.supplierFormSubmitted = false;
    this.isDuplicateSupplierPhone = false;
    this.showNewSupplierModal = true;
  }

  onSupplierSelect(value: string) {
    if (value === '__create__') {
      this.openNewSupplierModal();
      this.newPurchase.supplier = '';
      return;
    }
    this.newPurchase.supplier = value;
    this.checkDuplicateInvoice();
  }

  closeNewSupplierModal() {
    this.showNewSupplierModal = false;
    this.supplierFormSubmitted = false;
    this.isDuplicateSupplierPhone = false;
  }

  // ✅ 10-digit phone number format check
  isValidPhone(phone?: string): boolean {
    if (!phone) return false;
    return /^\d{10}$/.test(phone.trim());
  }

  // ✅ Same phone se already koi supplier bana hua to nahi
  checkDuplicateSupplierPhone() {
    const phone = (this.newSupplier.phone || '').trim();
    if (!phone) {
      this.isDuplicateSupplierPhone = false;
      return;
    }
    this.isDuplicateSupplierPhone = this.suppliers.some(
      s => (s.phone || '').trim() === phone
    );
  }

  addSupplier() {
    this.supplierFormSubmitted = true;
    this.checkDuplicateSupplierPhone();

    const isValid = !!this.newSupplier.name &&
      this.isValidPhone(this.newSupplier.phone) &&
      !this.isDuplicateSupplierPhone;

    if (!isValid) return;

    this.isSavingSupplier = true;

    this.supplierService.createSupplier(this.newSupplier as Supplier).subscribe({
      next: (created) => {
        this.suppliers = [created, ...this.suppliers];
        this.isSavingSupplier = false;
        this.showSuccessToast = true;
        this.closeNewSupplierModal();
        setTimeout(() => (this.showSuccessToast = false), 3000);
      },
      error: (err) => {
        this.isSavingSupplier = false;
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