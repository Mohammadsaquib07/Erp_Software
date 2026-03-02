import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetInvoiceService {
private apiUrl = "https://localhost:7246/api/CreateInvoice/GetInvoice"
private httpClient = inject(HttpClient)

getInvoiceById(id:number):Observable<any>{
return this.httpClient.get(`${this.apiUrl}/${23}`)
}

  constructor() { }
}
