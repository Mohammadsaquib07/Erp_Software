import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
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
  imports: [CommonModule, RouterModule, RouterOutlet, ReactiveFormsModule, InputTextModule, JsonPipe, PrintReportComponent],
  templateUrl: './product-component.component.html',
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
  editForm!: FormGroup;
  createItemForm!: FormGroup;
  invoiceItems: InvoiceProduct[] = []
  successMessage: string = '';
  errorMessage: string = '';
  showDeleteConfirm = false;
  productToDelete: number | null = null;
  dashboardService = inject(DashboardService)
  recentOrderService = inject(RecentOrdersService)
  recentOrders: RecentOrderDto[] = [];
  dashboardData: DashboardCardsDto | null = null;
  private getInvoiceService  = inject(GetInvoiceService)
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
        Email: [''],
        Phone: [''],
        BillingAddress: ['']
      }),
      invoice: this.fb.group({
        notes: [''],
        createdBy: ['Admin'],
        items: this.fb.array([this.createItem()])
      })
    });
  }
  loadItem() {
    this.itemservice.getAllItems().subscribe({
      next: (res) => {
        this.productList = res;
        console.log(res);
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
  
  ngOnInit(): void {
  // 1. Load initial data
  this.loadItem();
  this.initForms(); // Moved form logic to a helper for readability

  // 2. Load Dashboard Statistics
  this.dashboardService.getTopCardData().subscribe({
    next: data => this.dashboardData = data,
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Error loading dashboard data';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  });

  // 3. Load Recent Orders
  this.recentOrderService.getRecentOrders(10).subscribe({
    next: (data) => this.recentOrders = data,
    error: (err) => console.error('Order load error:', err)
  });

  // 4. Handle Invoice Loading (Conditional)
  const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    const id = Number(idParam);
    this.getInvoiceService.getInvoiceById(id).subscribe({
      next: (res) => {
        this.invoiceResponseData = res;
        // Optional: If you want to pre-fill the form with this data:
        // this.patchFormWithInvoice(res);
      },
      error: (err) => console.error('Invoice load error:', err)
    });
  }
}

// Helper to keep ngOnInit clean
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
      stock: this.Add['Stock'].value
    };

    this.itemservice.addItem(payload).subscribe({
      next: (createdProduct) => {
        this.productList.push(createdProduct);
        console.log("this is the end", this.productList)
        this.createItemForm.reset();
        this.closeModal();
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
  saveInvoice() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  const formValue = this.form.getRawValue();
  const payload: CreateInvoiceRequest = {
    IsNewCustomer: formValue.isNewCustomer,
    CustomerId: !formValue.isNewCustomer ? formValue.customer.customerId : null,
    Customer: formValue.isNewCustomer ? {
      Name: formValue.customer.Name,
      Email: formValue.customer.Email,
      Phone: formValue.customer.Phone,
      BillingAddress: formValue.customer.BillingAddress
    } : null,

    InvoiceDate: new Date().toISOString(),

    Notes: formValue.invoice.notes,

    Items: formValue.invoice.items.map((item: any) => ({
      ProductId: item.productId,
      Quantity: item.qty
    }))
  };
  this.SaveService.saveInvoice(payload).subscribe({
    next: (res) => {
      console.log('Invoice Created Successfully', res);
      // 'res' is the JSON response with the invoiceId we discussed earlier
      this.invoiceResponseData = res; 
    },
    error: (err) => console.error('Backend Error:', err)
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
