export interface InvoiceItem {
  ProductName: string;
  Price: number;
  Quantity: number;
}
export interface Invoice {
  IsnewCustomer: boolean
  customerId?: number;
  invoiceDate?: string; 
  notes?: string;
  createdBy?: string;
  items: InvoiceItem[];
}
export interface InvoiceProduct {
  productId: number ;
  productName: string;
  price: number;
  qty: number;
  availableStock: number;
  total: number;
}
export interface FullInvoiceRequest {
  isNewCustomer: boolean;
  customer?: CustomerDto; 
  invoice: InvoiceDto;
}
export interface InvoiceDto {
  customerId: number;
  invoiceDate?: Date; 
  notes?: string;
  createdBy?: string;
  items: InvoiceItemDto[];
}
export interface InvoiceItemDto {
  productName: string;
  price: number;
  quantity: number;
} 
export interface CustomerDto {
  customerId: number;  
  name: string;          
  email?: string;
  phone?: string;
  billingAddress?: string;
  createdAt?: Date;
  invoices?: Invoices[]; 
}
export interface Invoices {
  invoiceId: number;
}
export interface DetailedInvoiceResponse {
  invoiceId: number;
  invoiceNumber: string;
  customerId: number;
  invoiceDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  createdBy: string;
  createdAt: string;
  customer: CustomerDto; // Uses your existing CustomerDto
  items: InvoiceItemResponse[]; // Specific to the returned items
}
export interface InvoiceItemResponse {
  itemId: number;
  invoiceId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}
export interface CreateCustomerDto {
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  BillingAddress?: string | null;
}
export interface InvoiceItemRequestDto {
  ProductId: number;
  Quantity: number;
}
export interface CreateInvoiceRequest {
  IsNewCustomer: boolean;
  CustomerId?: number | null;
  Customer?: CreateCustomerDto | null;
  InvoiceDate: string; // DateTime in C#
  Notes?: string | null;
  Items: InvoiceItemRequestDto[];
}