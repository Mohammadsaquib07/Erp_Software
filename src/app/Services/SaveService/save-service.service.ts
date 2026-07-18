import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateInvoiceRequest, DetailedInvoiceResponse, FullInvoiceRequest } from '../../../Types/Invoice';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaveServiceService {
  private createInvoiceUrl = "https://localhost:7246/api/CreateInvoice/CreateInvoice"
  private createInvoiceWithExistingCustomerUrl = "https://localhost:7246/api/CreateInvoice/CreateInvoiceWithExistingCustomer"
  private getInvoiceId = "https://localhost:7246/api/CreateInvoice/GetInvoice"
  private httpClient = inject(HttpClient)

  saveInvoice(payload: CreateInvoiceRequest): Observable<any> {
    // Use appropriate endpoint based on whether it's a new customer
    const endpoint = payload.IsNewCustomer 
      ? this.createInvoiceUrl 
      : this.createInvoiceWithExistingCustomerUrl;
    return this.httpClient.post<any>(endpoint, payload);
  }
  
  constructor() { }
  
  getInvoiceById(id: number): Observable<DetailedInvoiceResponse> {
    return this.httpClient.get<DetailedInvoiceResponse>(`${this.getInvoiceId}/${id}`);
  }
}