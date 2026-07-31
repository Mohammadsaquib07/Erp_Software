import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GetInvoiceService {
private apiUrl = "https://localhost:7246/api/CreateInvoice/GetInvoice"
private httpClient = inject(HttpClient)

getInvoiceById(id:number):Observable<any>{
  return this.httpClient.get(`${this.apiUrl}/${id}`).pipe(
    map((res: any) => {
      if (!res) return null;
      // API sometimes wraps result in { Success: true, Data: ... }
      if (res.Data) return res.Data;
      if (res.data) return res.data;
      return res;
    })
  );
}

  constructor() { }
}
