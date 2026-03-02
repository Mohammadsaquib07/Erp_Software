import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateInvoiceRequest, DetailedInvoiceResponse, FullInvoiceRequest } from '../../../Types/Invoice';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaveServiceService {
  private apiUrl = "https://localhost:7246/api/CreateInvoice/CreateInvoice"
  private getInvoiceId = "https://localhost:7246/api/CreateInvoice/GetInvoice"
  private httpClient = inject(HttpClient)

  saveInvoice(payload: CreateInvoiceRequest): Observable<any> {
    alert(JSON.stringify(payload))
    return this.httpClient.post<any>(this.apiUrl, payload);
  }
  constructor() { }
  
  getInvoiceById(id: number): Observable<DetailedInvoiceResponse> {
    return this.httpClient.get<DetailedInvoiceResponse>(`${this.getInvoiceId}/${id}`);
  }
}