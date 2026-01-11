import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DashboardCardsDto } from '../Model/DashboardCardsDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = "https://localhost:7246/api/Dashboard/cards"
  constructor(private http:HttpClient) { }

  getTopCardData():Observable<DashboardCardsDto[]>{
   return this.http.get<DashboardCardsDto[]>(this.apiUrl)
  }

}
