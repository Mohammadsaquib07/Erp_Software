export interface PurchaseInvoiceItem {
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface PurchaseInvoiceApi {
   id: number;
  invoiceDate: string;
  invoiceNumber: string;
  status: 'Paid' | 'Pending' | 'Unpaid';
  supplierName: string;
  totalAmount: number;
}