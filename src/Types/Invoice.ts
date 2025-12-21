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
