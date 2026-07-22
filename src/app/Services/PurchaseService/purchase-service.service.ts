import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseInvoiceApi } from '../../Model/Purchase_Model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseServiceService {

  private  apiUrl = "https://localhost:7246/api/purchase-invoices"
  constructor(private http:HttpClient) { }
  
  getAllInvoices():Observable<PurchaseInvoiceApi[]>{
    return this.http.get<PurchaseInvoiceApi[]>(this.apiUrl)
  }
  createInvoice(invoice:PurchaseInvoiceApi):Observable<PurchaseInvoiceApi>{
    return this.http.post<PurchaseInvoiceApi>(this.apiUrl,invoice)
  }
}
