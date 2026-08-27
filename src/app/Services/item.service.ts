import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  name: string;
  price: number;
  stock: number;
  variants?: Array<{
    values: string[];
    sku: string;
    purchasePrice: number;
    stockQty: number;
    status: 'Active' | 'Inactive';
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  
private apiUrl = "https://localhost:7246/api/Item";

constructor(private httpClient:HttpClient) { }

getAllItems():Observable<any[]>{
  return this.httpClient.get<any[]>(this.apiUrl);
}

updateRecord(id:number,data:any):Observable<any>{
return this.httpClient.put<any>(`${this.apiUrl}/${id}`,data);
}

deleteRecord(id:number):Observable<any>{
return this.httpClient.delete<any>(`${this.apiUrl}/${id}`);
}
addItem(data:Product):Observable<Product>{
  alert(JSON.stringify(data))
  return this.httpClient.post<any>(this.apiUrl,data);
}
}