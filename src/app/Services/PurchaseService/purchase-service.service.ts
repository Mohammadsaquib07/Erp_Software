import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatePurchaseInvoiceDto, PurchaseInvoiceApi } from '../../Model/Purchase_Model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseServiceService {

  private  apiUrl = "https://localhost:7246/api/purchase-invoices"
  
  constructor(private http:HttpClient) { }
  
  getAllInvoices():Observable<PurchaseInvoiceApi[]>{
    return this.http.get<PurchaseInvoiceApi[]>(this.apiUrl)
  }
  createInvoice(invoice:CreatePurchaseInvoiceDto):Observable<CreatePurchaseInvoiceDto>{
    alert(JSON.stringify(invoice))
    return this.http.post<CreatePurchaseInvoiceDto>(this.apiUrl,invoice)
  }
}
