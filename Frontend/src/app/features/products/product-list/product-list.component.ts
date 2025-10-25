import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../core/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="product-container">
      <div class="page-header">
        <h1 class="page-title">Products</h1>
        <button class="btn btn-primary" (click)="openProductModal()">+ Add Product</button>
      </div>

      <div class="search-section">
        <div class="search-box">
          <input type="text" placeholder="Search" [(ngModel)]="searchTerm" (input)="filterProducts()" />
        </div>
        <div class="filters">
          <label>
            <input type="checkbox" [(ngModel)]="showLowStockOnly" (change)="loadProducts()" />
            Show Low Stock Only
          </label>
        </div>
      </div>

      <div class="card">
        <table *ngIf="filteredProducts.length > 0">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of filteredProducts" [class.low-stock]="product.isLowStock">
              <td>{{ product.productCode }}</td>
              <td>{{ product.productName }}</td>
              <td>{{ product.categoryName || '-' }}</td>
              <td>\${{ product.unitPrice.toFixed(2) }}</td>
              <td>{{ product.stockQuantity }} {{ product.unit }}</td>
              <td>
                <span class="badge" [class.badge-warning]="product.isLowStock">
                  {{ product.isLowStock ? 'Low Stock' : 'In Stock' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-warning" (click)="editProduct(product)">Edit</button>
                <button class="btn btn-sm btn-danger" (click)="deleteProduct(product.productId)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="loading" class="spinner"></div>
        <p *ngIf="!loading && filteredProducts.length === 0" class="no-results">No products found.</p>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="modal" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h2>
          <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        <form (ngSubmit)="saveProduct()" #productForm="ngForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Product Name *</label>
              <input type="text" [(ngModel)]="productFormData.productName" name="productName" required />
            </div>
            <div class="form-group">
              <label>Product Code *</label>
              <input type="text" [(ngModel)]="productFormData.productCode" name="productCode" [disabled]="isEditMode" required />
            </div>
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="productFormData.categoryId" name="categoryId">
                <option [ngValue]="null">-- No Category --</option>
                <option *ngFor="let cat of categories" [ngValue]="cat.categoryId">{{ cat.categoryName }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Unit Price *</label>
              <input type="number" [(ngModel)]="productFormData.unitPrice" name="unitPrice" min="0" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Stock Quantity *</label>
              <input type="number" [(ngModel)]="productFormData.stockQuantity" name="stockQuantity" min="0" required />
            </div>
            <div class="form-group">
              <label>Min Stock Level *</label>
              <input type="number" [(ngModel)]="productFormData.minStockLevel" name="minStockLevel" min="0" required />
            </div>
            <div class="form-group">
              <label>Unit *</label>
              <input type="text" [(ngModel)]="productFormData.unit" name="unit" required />
            </div>
            <div class="form-group">
              <label>Image URL</label>
              <input type="text" [(ngModel)]="productFormData.imageUrl" name="imageUrl" />
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="productFormData.description" name="description" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="!productForm.valid || saving">
              {{ saving ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .product-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 400;
      color: #e0e0e0;
      margin: 0;
    }

    .search-section {
      margin-bottom: 20px;
    }

    .search-box {
      margin-bottom: 15px;
    }

    .search-box input {
      width: 100%;
      max-width: 400px;
      padding: 12px 16px;
      background-color: #0f2838;
      border: 1px solid #1a3a4d;
      border-radius: 6px;
      color: #e0e0e0;
      font-size: 0.95rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #f39c12;
    }

    .search-box input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .filters {
      margin-bottom: 10px;
    }

    .filters label {
      color: #e0e0e0;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 0.85rem;
      background: #2ecc71;
      color: white;
    }

    .badge-warning {
      background: #f39c12;
    }

    .low-stock {
      background-color: rgba(243, 156, 18, 0.15) !important;
    }

    .no-results {
      text-align: center;
      padding: 40px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.95rem;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
      margin-right: 5px;
    }

    .btn-danger {
      background: #e74c3c;
      border-color: #e74c3c;
    }

    .btn-danger:hover {
      background: #c0392b;
      border-color: #c0392b;
    }

    /* Modal Styles */
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
      background: #0f2838;
      padding: 0;
      border-radius: 8px;
      width: 90%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid #1a3a4d;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #1a3a4d;
    }

    .modal-header h2 {
      margin: 0;
      color: #e0e0e0;
      font-weight: 400;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.5);
    }

    .close-btn:hover {
      color: #f39c12;
    }

    form {
      padding: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #e0e0e0;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 8px 12px;
      border: 1px solid #1a3a4d;
      border-radius: 4px;
      font-size: 14px;
      background-color: #0a1f2e;
      color: #e0e0e0;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #f39c12;
    }

    .form-group input:disabled {
      background-color: #051119;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #1a3a4d;
    }

    .btn-secondary {
      background: #6c757d;
      border-color: #6c757d;
    }

    .btn-secondary:hover {
      background: #5a6268;
      border-color: #5a6268;
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products: Product[] = [];
  filteredProducts: Product[] = []; // search results
  categories: Category[] = [];
  loading = false;
  showLowStockOnly = false;
  searchTerm = '';

  // modal variables
  showModal = false;
  isEditMode = false;
  saving = false;
  productId: number | null = null; // currently editing

  // form fields
  productFormData: any = this.getEmptyForm();

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // fetch products from API
  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.showLowStockOnly).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        console.log('loaded products:', products.length); // debug
        this.filterProducts(); // apply search if any
        this.loading = false;
      },
      error: (error) => {
        console.error('failed to load products:', error);
        alert('Failed to load products'); // TODO: replace with toast notification
        this.loading = false;
      }
    });
  }

  // search through products by name, code or category
  filterProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProducts = this.products; // show everything
      return;
    }

    // simple filter - might add fuzzy search later if needed
    this.filteredProducts = this.products.filter(p =>
      p.productName.toLowerCase().includes(term) ||
      p.productCode.toLowerCase().includes(term) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(term))
    );
    console.log('search results:', this.filteredProducts.length);
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  openProductModal(): void {
    this.isEditMode = false;
    this.productId = null;
    this.productFormData = this.getEmptyForm();
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.productId = product.productId;
    // populate form with existing data
    this.productFormData = {
      productName: product.productName,
      productCode: product.productCode,
      categoryId: product.categoryId || null,
      description: product.description || '',
      unitPrice: product.unitPrice,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      unit: product.unit,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.productFormData = this.getEmptyForm();
  }

  // save or update product
  saveProduct(): void {
    this.saving = true;
    console.log('saving product:', this.productFormData);

    if (this.isEditMode && this.productId) {
      // updating existing product
      const updateRequest: UpdateProductRequest = {
        productName: this.productFormData.productName,
        categoryId: this.productFormData.categoryId,
        description: this.productFormData.description,
        unitPrice: Number(this.productFormData.unitPrice), // make sure it's number
        stockQuantity: Number(this.productFormData.stockQuantity),
        minStockLevel: Number(this.productFormData.minStockLevel),
        unit: this.productFormData.unit,
        imageUrl: this.productFormData.imageUrl,
        isActive: this.productFormData.isActive ?? true
      };

      this.productService.updateProduct(this.productId, updateRequest).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProducts(); // refresh list
          alert('Product updated successfully!');
        },
        error: (error) => {
          console.error('update failed:', error);
          alert(error.error?.message || 'Failed to update product');
          this.saving = false;
        }
      });
    } else {
      // creating new product
      const createRequest: CreateProductRequest = {
        productName: this.productFormData.productName,
        productCode: this.productFormData.productCode,
        categoryId: this.productFormData.categoryId,
        description: this.productFormData.description,
        unitPrice: Number(this.productFormData.unitPrice),
        stockQuantity: Number(this.productFormData.stockQuantity),
        minStockLevel: Number(this.productFormData.minStockLevel),
        unit: this.productFormData.unit,
        imageUrl: this.productFormData.imageUrl
      };

      this.productService.createProduct(createRequest).subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadProducts();
          alert('Product created successfully!');
        },
        error: (error) => {
          console.error('create failed:', error);
          alert(error.error?.message || 'Failed to create product');
          this.saving = false;
        }
      });
    }
  }

  // remove product
  deleteProduct(productId: number): void {
    if (confirm('Are you sure? This cannot be undone.')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
          alert('Product deleted successfully!');
        },
        error: (error) => {
          console.error('delete failed:', error);
          alert('Failed to delete product'); // might be used in invoices
        }
      });
    }
  }

  // clear form fields
  private getEmptyForm(): any {
    return {
      productName: '',
      productCode: '',
      categoryId: null,
      description: '',
      unitPrice: 0,
      stockQuantity: 0,
      minStockLevel: 10, // default minimum
      unit: 'pcs',
      imageUrl: '',
      isActive: true
    };
  }
}

