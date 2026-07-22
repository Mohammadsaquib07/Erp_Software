import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Supplier } from '../Components/purchase-screen/purchase-screen.component';

@Injectable({
  providedIn: 'root'
})
export class SupplierServiceService {

  private baseUrl = 'https://localhost:7246/api/Supplier';

  constructor(private http: HttpClient) { }

  getAllSUpplier(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.baseUrl)
  }
  createSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.baseUrl, supplier);
  }
}
