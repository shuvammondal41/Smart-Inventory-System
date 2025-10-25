import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/products';

  getProducts(lowStockOnly?: boolean, categoryId?: number, activeOnly: boolean = true): Observable<Product[]> {
    let params = new HttpParams();
    if (lowStockOnly !== undefined) {
      params = params.set('lowStockOnly', lowStockOnly);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    params = params.set('activeOnly', activeOnly);

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: UpdateProductRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  adjustStock(productId: number, quantity: number, transactionType: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/adjust-stock`, {
      productId,
      quantity,
      transactionType,
      notes
    });
  }
}
