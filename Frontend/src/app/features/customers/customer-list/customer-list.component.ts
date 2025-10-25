import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, CreateCustomerRequest } from '../../../core/models/models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Customers</h1>
        <button class="btn btn-primary" (click)="openCustomerModal()">+ Add Customer</button>
      </div>

      <div class="card">
        <table *ngIf="customers.length > 0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of customers">
              <td>{{ customer.customerName }}</td>
              <td>{{ customer.email || '-' }}</td>
              <td>{{ customer.phone || '-' }}</td>
              <td>{{ customer.address || '-' }}</td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="editCustomer(customer)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="deleteCustomer(customer.customerId)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="loading" class="spinner"></div>
        <p *ngIf="!loading && customers.length === 0">No customers found.</p>
      </div>
    </div>

    <!-- Customer Modal -->
    <div class="modal" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Customer' : 'Add New Customer' }}</h2>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        <form (ngSubmit)="saveCustomer()" #customerForm="ngForm">
          <div class="form-group">
            <label>Customer Name *</label>
            <input type="text" [(ngModel)]="customerFormData.customerName" name="customerName" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="customerFormData.email" name="email" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="customerFormData.phone" name="phone" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea [(ngModel)]="customerFormData.address" name="address" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!customerForm.valid || saving">
              {{ saving ? 'Saving...' : 'Save Customer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
      margin-right: 5px;
    }

    .btn-danger {
      background: #e74c3c;
    }

    .btn-danger:hover {
      background: #c0392b;
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

    .modal-content {
      background: white;
      padding: 0;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
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

    form {
      padding: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 15px;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-group input,
    .form-group textarea {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3498db;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }

    .btn-secondary {
      background: #95a5a6;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }
  `]
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);

  customers: Customer[] = [];
  loading = false;

  // Modal state
  showModal = false;
  isEditMode = false;
  saving = false;
  editingCustomerId: number | null = null;

  // Form data
  customerFormData: CreateCustomerRequest = this.getEmptyFormData();

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        alert('Failed to load customers');
        this.loading = false;
      }
    });
  }

  openCustomerModal(): void {
    this.isEditMode = false;
    this.editingCustomerId = null;
    this.customerFormData = this.getEmptyFormData();
    this.showModal = true;
  }

  editCustomer(customer: Customer): void {
    this.isEditMode = true;
    this.editingCustomerId = customer.customerId;
    this.customerFormData = {
      customerName: customer.customerName,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.customerFormData = this.getEmptyFormData();
  }

  saveCustomer(): void {
    this.saving = true;

    if (this.isEditMode && this.editingCustomerId) {
      // Update existing customer
      this.customerService.updateCustomer(this.editingCustomerId, this.customerFormData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadCustomers();
          alert('Customer updated successfully!');
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          alert(error.error?.message || 'Failed to update customer');
          this.saving = false;
        }
      });
    } else {
      // Create new customer
      this.customerService.createCustomer(this.customerFormData).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadCustomers();
          alert('Customer created successfully!');
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          alert(error.error?.message || 'Failed to create customer');
          this.saving = false;
        }
      });
    }
  }

  deleteCustomer(customerId: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(customerId).subscribe({
        next: () => {
          this.loadCustomers();
          alert('Customer deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          alert('Failed to delete customer');
        }
      });
    }
  }

  private getEmptyFormData(): CreateCustomerRequest {
    return {
      customerName: '',
      email: '',
      phone: '',
      address: ''
    };
  }
}
