import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecentOrderDto } from '../../../Types/RecentOrderDto';

@Injectable({
  providedIn: 'root'
})
export class RecentOrdersService {
  private apiUrl = 'https://localhost:7246/api/dashboard';

  constructor(private http: HttpClient) { }
  getRecentOrders(take: number = 10) {
    return this.http.get<RecentOrderDto[]>(
      `${this.apiUrl}/recent-orders?take=${take}`
    );
  }
}
