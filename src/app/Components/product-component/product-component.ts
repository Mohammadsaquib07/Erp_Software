import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ItemService, Product } from '../../Services/item.service';
import { FullInvoiceRequest } from '../../../Types/Invoice';

@Component({
  selector: 'app-product-component',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ReactiveFormsModule, InputTextModule],
  templateUrl: './product-component.component.html',
  styleUrls: ['./product-component.component.css']
})
export class ProductComponent implements OnInit {
  form: FormGroup;
  isInvoiceOpen = false;
  showModal = false;
  productList: any[] = [];
  showEditModal = false;
  isManageProductOpen = false;
  selectedProduct: any = null;
  editForm!: FormGroup;
  createItemForm!: FormGroup;

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
      ...this.editForm.value
    }
    const id = this.selectedProduct.id;
    this.itemservice.updateRecord(id, updatedRecord).subscribe({
      next: () => {
        alert('Record Updated Successfully');
        this.loadItem();
        this.closeEditModal();
      },
      error: (err) => {
        console.log(err);
        alert('Error updating record');
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
    debugger
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
  openInvoicePage1() {
    this.routerObj.navigate(['sales/invoice']);
  }
  ngOnInit(): void {
    this.loadItem();
    this.editForm = this.fb.group({
      Name: ['', Validators.required],
      Price: [null, [Validators.required, Validators.min(0)]],
      Stock: [null, [Validators.required, Validators.min(0)]]
    });
    this.createItemForm = this.fb.group({
      Name: ['', Validators.required],
      Price: [null, [Validators.required, Validators.min(0)]],
      Stock: [null, [Validators.required, Validators.min(0)]]
    });
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
        this.productList.unshift(createdProduct);
        this.createItemForm.reset();
        this.closeModal();
        alert('Product Added Successfully');
      },
      error: (err) => {
        console.error(err);
        alert('Error adding product');
      }
    });
  };

  get Add() {
    return this.createItemForm.controls;
  }
  private createItem(): FormGroup {
    return this.fb.group({
      ProductName: [''],
      Price: [0],
      Quantity: [0]
    });
  }
  get items(): FormArray {
    return this.form.get('invoice.items') as FormArray;
  }
  deleteProduct(id: number) {
    this.itemservice.deleteRecord(id).subscribe({
      next: () => {
        alert('Record Deleted Successfully');
        this.loadItem();
      },
      error: (err) => {
        console.log(err);
        alert('Error deleting record');
      }
    });
  }
  addItem() {
    this.items.push(this.createItem());
  }
  removeItem(index: number) {
    this.items.removeAt(index);
  }
  getTotal(item: AbstractControl): number {
    const fg = item as FormGroup;
    const qty = Number(fg.get('Quantity')?.value) || 0;
    const price = Number(fg.get('Price')?.value) || 0;
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
    const customerGroup = this.form.get('customer') as FormGroup;
    const invoiceGroup = this.form.get('invoice') as FormGroup;
    const payload: FullInvoiceRequest = {
      isNewCustomer: this.form.value.isNewCustomer,
      customer: {
        customerId: 0,
        name: customerGroup.value.Name,
        email: customerGroup.value.Email,
        phone: customerGroup.value.Phone,
        billingAddress: customerGroup.value.BillingAddress
      },
      invoice: {
        customerId: 0, // backend will update
        notes: invoiceGroup.value.notes,
        createdBy: invoiceGroup.value.createdBy,
        items: this.items.value.map((i: any) => ({
          productName: i.ProductName,
          price: i.Price,
          quantity: i.Quantity
        }))
      }
    };
  }
}