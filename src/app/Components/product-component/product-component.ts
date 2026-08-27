import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ItemService, Product } from '../../Services/item.service';
import { CreateInvoiceRequest, DetailedInvoiceResponse, FullInvoiceRequest, InvoiceItem, InvoiceProduct, } from '../../../Types/Invoice';
import { DashboardService } from '../../Services/dashboard.service';
import { DashboardCardsDto } from '../../Model/DashboardCardsDto';
import { RecentOrderDto } from '../../../Types/RecentOrderDto';
import { RecentOrdersService } from '../../Services/RecentOrderService/recent-orders.service';
import { GetInvoiceService } from '../../Services/GetInvoiceService/get-invoice.service';
import { SaveServiceService } from '../../Services/SaveService/save-service.service';
import { PrintReportComponent } from '../print-report/print-report.component';

@Component({
  selector: 'app-product-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, InputTextModule, PrintReportComponent],
  templateUrl:'./product-component.component.html',
  styleUrls: ['./product-component.component.css']
})

export class ProductComponent implements OnInit {

  form: FormGroup;
  isInvoiceOpen = false;
  showModal = false;
  isReportOpen = false;
  isInventoryReportOpen = false;
  @Input() pageMode: 'sales' | 'inventory' = 'sales';
  productList: any[] = []
  getList: InvoiceProduct[] = []
  tempList: any
  showEditModal = false;
  isManageProductOpen = false;
  selectedProduct: any = null;
  selectedVariantProduct: Product | null = null;
  editForm!: FormGroup;
  createItemForm!: FormGroup;
  invoiceItems: InvoiceProduct[] = []
  successMessage: string = '';

  openVariantDetails(product: Product): void {
    this.selectedVariantProduct = product;
  }

  closeVariantDetails(): void {
    this.selectedVariantProduct = null;
  }

  get selectedVariantValues(): string[] {
    return this.selectedVariantProduct?.variants?.[0]?.values ?? [];
  }
  errorMessage: string = '';
  showDeleteConfirm = false;
  productToDelete: number | null = null;
  dashboardService = inject(DashboardService)
  recentOrderService = inject(RecentOrdersService)
  recentOrders: RecentOrderDto[] = [];
  dashboardData: DashboardCardsDto | null = null;
  private getInvoiceService = inject(GetInvoiceService)
  private route = inject(ActivatedRoute)
  invoiceResponseData = signal<DetailedInvoiceResponse | null>(null);
  private SaveService = inject(SaveServiceService)
  private router = inject(Router)
  openEditModal(product: any) {
    this.showEditModal = true;
    this.selectedProduct = product;
    this.editForm.patchValue({
      Name: product.name,
      Price: product.price,
      Stock: product.stock
    });
  }
  updateRecord() {
    if (this.editForm.invalid) return;
    const updatedRecord = {
      Name: this.f['Name'].value?.trim(),
      Price: this.f['Price'].value,
      Stock: this.f['Stock'].value
    }
    const id = this.selectedProduct.id;
    this.itemservice.updateRecord(id, updatedRecord).subscribe({
      next: () => {
        this.successMessage = 'Record Updated Successfully';
        this.loadItem();
        this.closeEditModal();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Error updating record';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    })
  }
  closeEditModal() {
    this.showEditModal = false;
  }
  @Input() productListData: any[] = [];
  @Output() close = new EventEmitter<void>();
  openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }
  selectProduct(product: any) {
    this.selectedProduct = product;
    this.showModal = false;
  }
  constructor(
    private routerObj: Router,
    private fb: FormBuilder,
    private itemservice: ItemService
  ) {

    this.form = this.fb.group({
      isNewCustomer: [true],
      customer: this.fb.group({
        Name: [''],
        Email: ['']
      }),
      invoice: this.fb.group({
        notes: [''],
        createdBy: ['Admin'],
        items: this.fb.array([this.createItem()])
      })
    });
  }

  variationTypes: Array<{
    id: string;
    name: string;
    options: string[];
  }> = [];

  variationRows: Array<{
    values: string[];
    sku: string;
    barcode?: string;
    purchasePrice?: number;
    sellingPrice?: number;
    stockQty?: number;
    weight?: string;
    image?: string;
    status: 'Active' | 'Inactive';
  }> = [];
  addVariationType(name: string = ''): void {
    const id =
      'vt-' + Date.now().toString(36) + '-' + this.variationTypes.length;

    this.variationTypes.push({
      id,
      name: name || 'Option',
      options: []
    });

    this.generateVariationRows();
  }
  removeVariationType(id: string): void {
    this.variationTypes = this.variationTypes.filter(v => v.id !== id);
    this.generateVariationRows();
  }
  addOptionToType(typeId: string, value: string): void {
    const type = this.variationTypes.find(v => v.id === typeId);
    if (!type) return;

    const val = value?.trim();
    if (!val) return;

    if (!type.options.includes(val)) {
      type.options.push(val);
    }

    this.generateVariationRows();
  }
  addOptionValue(typeId: string, value: string): void {
    this.addOptionToType(typeId, value);
  }
  removeOptionFromType(typeId: string, optionValue: string): void {
    const type = this.variationTypes.find(v => v.id === typeId);
    if (!type) return;

    type.options = type.options.filter(o => o !== optionValue);

    this.generateVariationRows();
  }
  private cartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce<string[][]>(
      (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
      [[]]
    );
  }
  generateVariationRows(): void {
    const optionSets = this.variationTypes.map(vt => vt.options);

    // Only generate variants when every option type has at least one value.
    if (!optionSets.length || optionSets.some(options => !options.length)) {
      this.variationRows = [];
      return;
    }

    const defaultPrice = this.createItemForm.get('Price')?.value ?? 0;
    const defaultStock = this.createItemForm.get('Stock')?.value ?? 0;

    const combos = this.cartesianProduct(optionSets);

    this.variationRows = combos.map(values => ({
      values,
      sku: '',
      purchasePrice: defaultPrice,
      stockQty: defaultStock,
      status: 'Active'
    }));
  }
  bulkUpdate(
    field: 'purchasePrice' | 'sellingPrice' | 'stockQty',
    value: number
  ): void {
    this.variationRows = this.variationRows.map(r => ({
      ...r,
      [field]: value
    }));
  }
  loadItem() {
    this.itemservice.getAllItems().subscribe({
      next: (res) => {
        // normalize product list responses (API sometimes returns wrapper)
        if (Array.isArray(res)) this.productList = res;
        else if (Array.isArray((res as any).Data)) this.productList = (res as any).Data;
        else if (Array.isArray((res as any).data)) this.productList = (res as any).data;
        else this.productList = [];
        console.log(this.productList);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  openManageProductPage() {
    this.isManageProductOpen = true;
  }
  closeManageProductPage() {
    this.isManageProductOpen = false;
  }
  openInvoicePage() {
    this.isInvoiceOpen = true;
  }
  closeInvoice() {
    this.isInvoiceOpen = false;
  }
  openReportPage() {
    this.isReportOpen = true;
  }
  closeReportPage() {
    this.isReportOpen = false;
  }
  openInvoicePage1() {
    this.routerObj.navigate(['sales/invoice']);
  }
  viewPrintReports() {
    this.openReportPage();
  }
  viewInventoryReports() {
    this.isInventoryReportOpen = true;
  }
  closeInventoryReportPage() {
    this.isInventoryReportOpen = false;
  }
  hasAnyMissingOptions(): boolean {
    return this.variationTypes.some(t => !t.options.length);
  }
  hasAllOptionsValues(): boolean {
    return this.variationTypes.length > 0 && !this.variationTypes.some(t => !t.options.length);
  }
  ngOnInit(): void {
    // 1. Load initial data
    this.loadItem();
    this.initForms(); // Moved form logic to a helper for readability

    // 2. Load Dashboard Statistics
    this.dashboardService.getTopCardData().subscribe({
      next: data => {
        if (!data) this.dashboardData = null;
        else if ((data as any).Data) this.dashboardData = (data as any).Data;
        else if ((data as any).data) this.dashboardData = (data as any).data;
        else this.dashboardData = data;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error loading dashboard data';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });

    // 3. Load Recent Orders
    this.recentOrderService.getRecentOrders(10).subscribe({
      next: (data) => {
        if (Array.isArray(data)) this.recentOrders = data;
        else if (Array.isArray((data as any).Data)) this.recentOrders = (data as any).Data;
        else if (Array.isArray((data as any).data)) this.recentOrders = (data as any).data;
        else this.recentOrders = [];
      },
      error: (err) => console.error('Order load error:', err)
    });

    // 4. Handle Invoice Loading (Conditional)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.getInvoiceService.getInvoiceById(id).subscribe({
        next: (res) => {
          // service returns normalized data (or wrapper.Data)
          this.invoiceResponseData = (res as any)?.Data ? (res as any).Data : res;
        },
        error: (err) => console.error('Invoice load error:', err)
      });
    }
  }
  private initForms(): void {
    const formConfig = {
      Name: ['', Validators.required],
      Price: [null, [Validators.required, Validators.min(0)]],
      Stock: [null, [Validators.required, Validators.min(0)]]
    };

    this.editForm = this.fb.group(formConfig);
    this.createItemForm = this.fb.group(formConfig);
  }
  get f() {
    /*This is just getter function..It must return values so*/
    /*whatever controls you have created in UI all controls will return this getter function*/
    return this.editForm.controls;
  }
  addProduct() {
    if (this.createItemForm.invalid) {
      this.createItemForm.markAllAsTouched();
      return;
    }

    const payload: Product = {
      name: this.Add['Name'].value.trim(),
      price: this.Add['Price'].value,
      stock: this.Add['Stock'].value,
      variants: this.variationRows.length ? this.variationRows.map(row => ({
        values: row.values,
        sku: row.sku,
        purchasePrice: row.purchasePrice ?? this.Add['Price'].value,
        stockQty: row.stockQty ?? this.Add['Stock'].value,
        status: row.status
      })) : undefined
    };

    this.itemservice.addItem(payload).subscribe({
      next: (createdProduct) => {
        this.loadItem(); // Refresh product list immediately
        this.createItemForm.reset();
        this.variationRows = []; // Clear variations
        this.variationTypes = []; // Clear variation types
        this.successMessage = 'Product Added Successfully';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error adding product';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });

  };
  get Add() {
    return this.createItemForm.controls;
  }
  private createItem(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      price: [0],
      qty: [1, [Validators.required, Validators.min(1)]]
    });
  }
  get items(): FormArray {
    return this.form.get('invoice.items') as FormArray;
  }
  deleteProduct(id: number) {
    this.productToDelete = id;
    this.showDeleteConfirm = true;
  }
  confirmDelete() {
    if (this.productToDelete !== null) {
      this.itemservice.deleteRecord(this.productToDelete).subscribe({
        next: () => {
          this.successMessage = 'Record Deleted Successfully';
          this.loadItem();
          setTimeout(() => this.successMessage = '', 3000);
          this.cancelDelete();
        },
        error: (err) => {
          console.log(err);
          this.errorMessage = 'Error deleting record';
          setTimeout(() => this.errorMessage = '', 3000);
          this.cancelDelete();
        }
      });
    }
  }
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.productToDelete = null;
  }
  addItem() {
    this.items.push(this.createItem());
  }
  removeItem(index: number) {
    this.items.removeAt(index);
  }
  getTotal(item: AbstractControl): number {
    const fg = item as FormGroup;
    const qty = Number(fg.get('qty')?.value) || 0;
    const price = Number(fg.get('price')?.value) || 0;
    return qty * price;
  }
  get subtotal(): number {
    return this.items.controls
      .map(ctrl => this.getTotal(ctrl))
      .reduce((a, b) => a + b, 0);
  }
  get tax(): number {
    return this.subtotal * 0.18; // 18% tax
  }
  get total(): number {
    return this.subtotal + this.tax;
  }
  saveInvoice(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required invoice fields before saving.';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    const formValue = this.form.getRawValue();

    // Validate items
    const items = (formValue.invoice?.items || [])
      .filter((item: any) => item?.productId != null && item?.productId !== '' && Number(item.qty) > 0)
      .map((item: any) => ({
        ProductId: Number(item.productId),
        Quantity: Number(item.qty)
      }));

    if (items.length === 0) {
      this.errorMessage = 'Please add at least one product line item before saving.';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    // Validate customer data
    const isNewCustomer = Boolean(formValue.isNewCustomer);
    if (isNewCustomer) {
      const customer = formValue.customer;
      if (!customer?.Name || !customer.Name.trim()) {
        this.errorMessage = 'Customer name is required.';
        setTimeout(() => (this.errorMessage = ''), 3000);
        return;
      }
      if (!customer?.Email || !customer.Email.trim()) {
        this.errorMessage = 'Customer email is required.';
        setTimeout(() => (this.errorMessage = ''), 3000);
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.Email)) {
        this.errorMessage = 'Please enter a valid email address.';
        setTimeout(() => (this.errorMessage = ''), 3000);
        return;
      }
    } else {
      // Validate existing customer selection
      if (!formValue.customer?.customerId || formValue.customer.customerId <= 0) {
        this.errorMessage = 'Please select a valid customer.';
        setTimeout(() => (this.errorMessage = ''), 3000);
        return;
      }
    }

    const customerPayload = isNewCustomer
      ? {
        Name: formValue.customer.Name.trim(),
        Email: formValue.customer.Email?.trim() || null
      }
      : null;

    const payload: CreateInvoiceRequest = {
      IsNewCustomer: isNewCustomer,
      CustomerId: !isNewCustomer ? formValue.customer?.customerId ?? null : null,
      Customer: customerPayload,
      InvoiceDate: new Date().toISOString(),
      Notes: formValue.invoice?.notes || null,
      Items: items
    };

    this.SaveService.saveInvoice(payload).subscribe({
      next: (res) => {
        console.log('Invoice Created Successfully', res);

        // Handle both new and updated response format
        if (res.Success && res.Data) {
          this.invoiceResponseData = res.Data;
          this.successMessage = 'Invoice saved successfully!';

          // Reset form after successful save
          this.form.reset({
            isNewCustomer: true,
            customer: {
              Name: '',
              Email: ''
            },
            invoice: {
              notes: '',
              createdBy: 'Admin',
              items: [this.createItem()]
            }
          });

          setTimeout(() => {
            this.successMessage = '';
            this.closeInvoice();
          }, 2000);
        } else if (res.InvoiceId) {
          // Fallback for old response format
          this.invoiceResponseData = res;
          this.successMessage = 'Invoice saved successfully!';
          setTimeout(() => (this.successMessage = ''), 3000);
        } else {
          // Unexpected response format
          console.warn('Unexpected response format:', res);
          this.errorMessage = 'Invoice saved but response format unexpected.';
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      },
      error: (err) => {
        console.error('Backend Error Details:', err);
        console.error('Error response:', err.error);

        // Extract error message from backend response
        let errorMsg = 'Unable to save invoice. Please try again.';

        // Check for consistent error response format
        if (err.error?.Message) {
          errorMsg = err.error.Message;
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.statusText) {
          errorMsg = 'Error: ' + err.statusText;
        } else if (err.message) {
          errorMsg = err.message;
        }

        this.errorMessage = errorMsg;
        setTimeout(() => (this.errorMessage = ''), 5000);
      }
    });
  }
  private getProductName(productId: number): string {
    const product = this.productList.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  }
  isProductAlreadySelected(productId: any, currentIndex: number): boolean {
    const targetId = Number(productId);
    return this.items.controls.some((ctrl, i) => {
      const selectedId = ctrl.get('productId')?.value;
      return i !== currentIndex && Number(selectedId) === targetId;
    });
  }
  onProductChange(index: number) {
    const itemGroup = this.items.at(index) as FormGroup;
    const productId = Number(itemGroup.get('productId')?.value);

    const product = this.productList.find(
      p => Number(p.id) === productId
    );

    if (!product) {
      console.error('Product not found for ID:', productId);
      return;
    }

    itemGroup.patchValue({
      price: product.price,
      qty: 1
    });

  }
  getInStockCount(): number {
    return this.productList.filter(product => Number(product.stock) > 0).length;
  }
  getLowStockProducts(): any[] {
    return this.productList.filter(product => Number(product.stock) < 10);
  }
}
