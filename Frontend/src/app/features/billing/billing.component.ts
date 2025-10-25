import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { Product, Customer, CreateInvoiceRequest, CreateInvoiceItemRequest } from '../../core/models/models';

interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="billing-container">
      <h1>New Sale / Billing</h1>

      <div class="billing-grid">
        <!-- Products Section -->
        <div class="products-section">
          <div class="search-box">
            <input
              type="text"
              placeholder="Search products..."
              [(ngModel)]="searchTerm"
              (input)="filterProducts()"
            />
          </div>

          <div class="products-list">
            <div
              *ngFor="let product of filteredProducts"
              class="product-card"
              (click)="addToCart(product)"
              [class.low-stock]="product.stockQuantity <= product.minStockLevel"
            >
              <div class="product-name">{{ product.productName }}</div>
              <div class="product-code">{{ product.productCode }}</div>
              <div class="product-price">\${{ product.unitPrice.toFixed(2) }}</div>
              <div class="product-stock">Stock: {{ product.stockQuantity }}</div>
            </div>
            <div *ngIf="filteredProducts.length === 0" class="no-products">
              No products found
            </div>
          </div>
        </div>

        <!-- Cart Section -->
        <div class="cart-section">
          <h2>Cart</h2>

          <div class="cart-items">
            <div *ngFor="let item of cart; let i = index" class="cart-item">
              <div class="item-details">
                <div class="item-name">{{ item.product.productName }}</div>
                <div class="item-price">\${{ item.product.unitPrice.toFixed(2) }}</div>
              </div>
              <div class="item-controls">
                <button class="qty-btn" (click)="decreaseQuantity(i)">-</button>
                <input
                  type="number"
                  [(ngModel)]="item.quantity"
                  (change)="updateCart()"
                  min="1"
                  [max]="item.product.stockQuantity"
                  class="qty-input"
                />
                <button class="qty-btn" (click)="increaseQuantity(i)">+</button>
                <button class="remove-btn" (click)="removeFromCart(i)">✕</button>
              </div>
              <div class="item-total">\${{ item.total.toFixed(2) }}</div>
            </div>
            <div *ngIf="cart.length === 0" class="empty-cart">
              Cart is empty. Add products to get started.
            </div>
          </div>

          <!-- Summary -->
          <div class="cart-summary">
            <div class="customer-select">
              <label>Customer (Optional):</label>
              <select [(ngModel)]="customerId">
                <option [ngValue]="null">Walk-in Customer</option>
                <option *ngFor="let customer of customers" [ngValue]="customer.customerId">
                  {{ customer.customerName }}
                </option>
              </select>
            </div>

            <div class="summary-row">
              <span>Subtotal:</span>
              <span>\${{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="summary-input-row">
              <label>Tax (%):</label>
              <input
                type="number"
                [(ngModel)]="taxPercent"
                (input)="updateTotals()"
                min="0"
                max="100"
                step="0.1"
              />
              <span>\${{ taxAmount.toFixed(2) }}</span>
            </div>

            <div class="summary-input-row">
              <label>Discount (\$):</label>
              <input
                type="number"
                [(ngModel)]="discountAmount"
                (input)="updateTotals()"
                min="0"
                [max]="subtotal"
                step="0.01"
              />
            </div>

            <div class="summary-row total">
              <strong>Total:</strong>
              <strong>\${{ total.toFixed(2) }}</strong>
            </div>

            <div class="payment-method">
              <label>Payment Method:</label>
              <select [(ngModel)]="paymentMethod">
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="payment-status">
              <label>Payment Status:</label>
              <select [(ngModel)]="paymentStatus">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            <div class="notes-section">
              <label>Notes:</label>
              <textarea [(ngModel)]="notes" rows="2" placeholder="Add notes..."></textarea>
            </div>

            <div class="action-buttons">
              <button class="btn btn-secondary" (click)="clearCart()">Clear</button>
              <button
                class="btn btn-primary"
                (click)="completeSale()"
                [disabled]="cart.length === 0 || processing"
              >
                {{ processing ? 'Processing...' : 'Complete Sale' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .billing-container {
      padding: 20px;
    }

    .billing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .products-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-box input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .products-list {
      max-height: 70vh;
      overflow-y: auto;
    }

    .product-card {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .product-card:hover {
      background: #f8f9fa;
      border-color: #3498db;
      transform: translateY(-2px);
    }

    .product-card.low-stock {
      border-left: 4px solid #f39c12;
    }

    .product-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .product-code {
      font-size: 12px;
      color: #666;
    }

    .product-price {
      font-size: 18px;
      color: #27ae60;
      font-weight: 600;
      margin-top: 8px;
    }

    .product-stock {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    .no-products {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .cart-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .cart-section h2 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }

    .cart-items {
      max-height: 40vh;
      overflow-y: auto;
      margin-bottom: 20px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 2fr 3fr 1fr;
      gap: 10px;
      align-items: center;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
    }

    .item-name {
      font-weight: 600;
      color: #333;
    }

    .item-price {
      font-size: 14px;
      color: #666;
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .qty-btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    .qty-btn:hover {
      background: #f0f0f0;
    }

    .qty-input {
      width: 50px;
      text-align: center;
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .remove-btn {
      width: 30px;
      height: 30px;
      border: none;
      background: #e74c3c;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 10px;
    }

    .remove-btn:hover {
      background: #c0392b;
    }

    .item-total {
      text-align: right;
      font-weight: 600;
      color: #27ae60;
    }

    .empty-cart {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .cart-summary {
      border-top: 2px solid #e0e0e0;
      padding-top: 20px;
    }

    .customer-select {
      margin-bottom: 15px;
    }

    .customer-select label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .customer-select select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }

    .summary-row.total {
      border-top: 2px solid #333;
      margin-top: 10px;
      padding-top: 10px;
      font-size: 20px;
    }

    .summary-input-row {
      display: grid;
      grid-template-columns: 1fr 80px 80px;
      gap: 10px;
      align-items: center;
      padding: 8px 0;
    }

    .summary-input-row input {
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-align: right;
    }

    .payment-method, .payment-status {
      margin-top: 15px;
    }

    .payment-method label,
    .payment-status label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .payment-method select,
    .payment-status select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .notes-section {
      margin-top: 15px;
    }

    .notes-section label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .notes-section textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .action-buttons .btn {
      flex: 1;
      padding: 12px;
      font-size: 16px;
    }

    .btn-secondary {
      background: #95a5a6;
    }

    .btn-secondary:hover {
      background: #7f8c8d;
    }

    @media (max-width: 1024px) {
      .billing-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BillingComponent implements OnInit {
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private invoiceService = inject(InvoiceService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  customers: Customer[] = [];
  cart: CartItem[] = []; // shopping cart items

  searchTerm = '';
  customerId: number | null = null; // selected customer

  // price calculations
  subtotal = 0;
  taxPercent = 0;
  taxAmount = 0;
  discountAmount = 0;
  total = 0;

  paymentMethod = 'Cash';
  paymentStatus = 'Paid';
  notes = '';
  processing = false;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
  }

  loadProducts(): void {
    // get all active products with stock
    this.productService.getProducts(false, undefined, true).subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        console.log('products loaded:', products.length);
      },
      error: (error) => {
        console.error('failed to load products:', error);
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('failed to load customers:', error);
      }
    });
  }

  // search products by name or code
  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredProducts = this.products;
      return;
    }

    this.filteredProducts = this.products.filter(p =>
      p.productName.toLowerCase().includes(term) ||
      p.productCode.toLowerCase().includes(term)
    );
  }

  // add product to cart
  addToCart(product: Product): void {
    if (product.stockQuantity <= 0) {
      alert('Product is out of stock!');
      return;
    }

    // check if already in cart
    const existingItem = this.cart.find(item => item.product.productId === product.productId);

    if (existingItem) {
      // increase quantity if stock available
      if (existingItem.quantity < product.stockQuantity) {
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * product.unitPrice;
      } else {
        alert('Cannot add more. Not enough stock!');
      }
    } else {
      // add new item to cart
      this.cart.push({
        product,
        quantity: 1,
        total: product.unitPrice
      });
    }

    this.updateTotals(); // recalculate prices
  }

  increaseQuantity(index: number): void {
    const item = this.cart[index];
    if (item.quantity < item.product.stockQuantity) {
      item.quantity++;
      item.total = item.quantity * item.product.unitPrice;
      this.updateTotals();
    } else {
      alert('Cannot add more. Not enough stock!');
    }
  }

  decreaseQuantity(index: number): void {
    const item = this.cart[index];
    if (item.quantity > 1) {
      item.quantity--;
      item.total = item.quantity * item.product.unitPrice;
      this.updateTotals();
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.updateTotals();
  }

  // validate and update cart quantities
  updateCart(): void {
    this.cart.forEach(item => {
      // make sure quantity doesn't exceed stock
      if (item.quantity > item.product.stockQuantity) {
        item.quantity = item.product.stockQuantity;
      }
      if (item.quantity < 1) {
        item.quantity = 1;
      }
      item.total = item.quantity * item.product.unitPrice;
    });
    this.updateTotals();
  }

  // recalculate subtotal, tax and total
  updateTotals(): void {
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
    this.taxAmount = (this.subtotal * this.taxPercent) / 100;
    this.total = this.subtotal + this.taxAmount - this.discountAmount;
  }

  clearCart(): void {
    if (confirm('Clear cart?')) {
      this.cart = [];
      this.updateTotals();
    }
  }

  // process sale and create invoice
  completeSale(): void {
    if (this.cart.length === 0) {
      return; // nothing to process
    }

    this.processing = true;
    console.log('processing sale...');

    // prepare invoice items
    const items: CreateInvoiceItemRequest[] = this.cart.map(item => ({
      productId: item.product.productId,
      quantity: item.quantity
    }));

    const invoice: CreateInvoiceRequest = {
      customerId: this.customerId || undefined,
      taxAmount: this.taxAmount,
      discountAmount: this.discountAmount,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      notes: this.notes || undefined,
      items
    };

    this.invoiceService.createInvoice(invoice).subscribe({
      next: (createdInvoice) => {
        alert(`Sale completed! Invoice #${createdInvoice.invoiceNumber}`);
        // clear everything
        this.cart = [];
        this.customerId = null;
        this.taxPercent = 0;
        this.taxAmount = 0;
        this.discountAmount = 0;
        this.notes = '';
        this.updateTotals();
        this.processing = false;
        this.loadProducts(); // refresh stock quantities
      },
      error: (error) => {
        console.error('sale failed:', error);
        alert(error.error?.message || 'Failed to complete sale');
        this.processing = false;
      }
    });
  }
}
