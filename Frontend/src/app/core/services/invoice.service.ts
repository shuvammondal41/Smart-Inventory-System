import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, CreateInvoiceRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/invoices';

  getInvoices(fromDate?: Date, toDate?: Date, customerId?: number): Observable<Invoice[]> {
    let params = new HttpParams();
    if (fromDate) {
      params = params.set('fromDate', fromDate.toISOString());
    }
    if (toDate) {
      params = params.set('toDate', toDate.toISOString());
    }
    if (customerId) {
      params = params.set('customerId', customerId);
    }

    return this.http.get<Invoice[]>(this.apiUrl, { params });
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }
}
