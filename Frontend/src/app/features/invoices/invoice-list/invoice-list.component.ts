import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../core/models/models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Invoices</h1>

      <div class="card">
        <table *ngIf="invoices.length > 0">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let invoice of invoices">
              <td><strong>{{ invoice.invoiceNumber }}</strong></td>
              <td>{{ invoice.invoiceDate | date:'short' }}</td>
              <td>{{ invoice.customerName || 'Walk-in Customer' }}</td>
              <td>{{ invoice.items?.length || 0 }} items</td>
              <td class="amount">\${{ invoice.totalAmount.toFixed(2) }}</td>
              <td>{{ invoice.paymentMethod }}</td>
              <td>
                <span class="badge" [ngClass]="getStatusClass(invoice.paymentStatus)">
                  {{ invoice.paymentStatus }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-info" (click)="viewInvoice(invoice)">View</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="loading" class="spinner"></div>
        <p *ngIf="!loading && invoices.length === 0">No invoices found.</p>
      </div>
    </div>

    <!-- Invoice Details Modal -->
    <div class="modal" *ngIf="showModal && selectedInvoice" (click)="closeModal()">
      <div class="modal-content invoice-detail" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Invoice Details - {{ selectedInvoice.invoiceNumber }}</h2>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        <div class="invoice-body">
          <div class="invoice-info">
            <div class="info-row">
              <span class="label">Date:</span>
              <span>{{ selectedInvoice.invoiceDate | date:'medium' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Customer:</span>
              <span>{{ selectedInvoice.customerName || 'Walk-in Customer' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Served By:</span>
              <span>{{ selectedInvoice.userName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Method:</span>
              <span>{{ selectedInvoice.paymentMethod }}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Status:</span>
              <span class="badge" [ngClass]="getStatusClass(selectedInvoice.paymentStatus)">
                {{ selectedInvoice.paymentStatus }}
              </span>
            </div>
          </div>

          <h3>Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of selectedInvoice.items">
                <td>{{ item.productName }}</td>
                <td>{{ item.productCode }}</td>
                <td>{{ item.quantity }}</td>
                <td>\${{ item.unitPrice.toFixed(2) }}</td>
                <td>\${{ item.totalPrice.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>\${{ selectedInvoice.subTotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Tax:</span>
              <span>\${{ selectedInvoice.taxAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Discount:</span>
              <span>-\${{ selectedInvoice.discountAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span><strong>Total:</strong></span>
              <span><strong>\${{ selectedInvoice.totalAmount.toFixed(2) }}</strong></span>
            </div>
          </div>

          <div *ngIf="selectedInvoice.notes" class="notes">
            <strong>Notes:</strong> {{ selectedInvoice.notes }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .amount {
      font-weight: 600;
      color: #27ae60;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 0.85rem;
      color: white;
    }

    .badge-paid {
      background: #27ae60;
    }

    .badge-pending {
      background: #f39c12;
    }

    .badge-partial {
      background: #e67e22;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
    }

    .btn-info {
      background: #3498db;
    }

    .btn-info:hover {
      background: #2980b9;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content.invoice-detail {
      background: white;
      padding: 0;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }

    .modal-header h2 {
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #999;
    }

    .close-btn:hover {
      color: #333;
    }

    .invoice-body {
      padding: 20px;
    }

    .invoice-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }

    .info-row .label {
      font-weight: 600;
      color: #555;
    }

    h3 {
      margin: 20px 0 10px 0;
      color: #333;
    }

    .items-table {
      width: 100%;
      margin-bottom: 20px;
    }

    .items-table td {
      padding: 8px;
    }

    .invoice-summary {
      border-top: 2px solid #ddd;
      padding-top: 15px;
      margin-top: 15px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 16px;
    }

    .summary-row.total {
      border-top: 2px solid #333;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 18px;
    }

    .notes {
      margin-top: 20px;
      padding: 15px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);

  invoices: Invoice[] = [];
  loading = false;
  showModal = false;
  selectedInvoice: Invoice | null = null;

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        alert('Failed to load invoices');
        this.loading = false;
      }
    });
  }

  viewInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedInvoice = null;
  }

  getStatusClass(status: string): string {
    return `badge-${status.toLowerCase()}`;
  }
}
