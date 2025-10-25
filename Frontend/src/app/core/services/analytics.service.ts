import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, SalesReport, TopProduct, StockAlert } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/analytics';

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getDailySales(fromDate?: Date, toDate?: Date): Observable<SalesReport[]> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }
    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }
    return this.http.get<SalesReport[]>(`${this.apiUrl}/daily-sales`, { params });
  }

  getMonthlySales(months: number = 12): Observable<SalesReport[]> {
    return this.http.get<SalesReport[]>(`${this.apiUrl}/monthly-sales`, {
      params: new HttpParams().set('months', months)
    });
  }

  getTopProducts(days: number = 30): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/top-products`, {
      params: new HttpParams().set('days', days)
    });
  }

  getStockAlerts(unresolvedOnly: boolean = true): Observable<StockAlert[]> {
    return this.http.get<StockAlert[]>(`${this.apiUrl}/stock-alerts`, {
      params: new HttpParams().set('unresolvedOnly', unresolvedOnly)
    });
  }

  resolveStockAlert(alertId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/stock-alerts/${alertId}/resolve`, {});
  }
}
