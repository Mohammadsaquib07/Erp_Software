export interface PurchaseInvoiceItem {
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface PurchaseInvoiceApi {
   id: number;
  invoiceDate: string;
  invoiceNumber: string;
  supplierId: number;
  status: 'Paid' | 'Pending' | 'Unpaid';
  supplierName: string;
  totalAmount: number;
}

export interface CreatePurchaseInvoiceDto {
  supplierId: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}