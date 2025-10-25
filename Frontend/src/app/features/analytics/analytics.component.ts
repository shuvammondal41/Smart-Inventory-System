import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardStats, SalesReport, TopProduct, StockAlert } from '../../core/models/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Analytics & Reports</h1>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Today's Sales</div>
          <div class="stat-value">\${{ stats?.todaySales?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Today's Invoices</div>
          <div class="stat-value">{{ stats?.todayInvoices || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Month Sales</div>
          <div class="stat-value">\${{ stats?.monthSales?.toFixed(2) || '0.00' }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Low Stock Items</div>
          <div class="stat-value">{{ stats?.lowStockProductsCount || 0 }}</div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="card">
        <h2>Top Selling Products (Last 30 Days)</h2>
        <table *ngIf="topProducts.length > 0">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Code</th>
              <th>Qty Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of topProducts; let i = index">
              <td><strong>#{{ i + 1 }}</strong></td>
              <td>{{ product.productName }}</td>
              <td>{{ product.productCode }}</td>
              <td>{{ product.totalQuantitySold }}</td>
              <td class="revenue">\${{ product.totalRevenue.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="loading" class="spinner"></div>
        <p *ngIf="!loading && topProducts.length === 0">No sales data available.</p>
      </div>

      <!-- Monthly Sales Trend -->
      <div class="card">
        <h2>Monthly Sales Trend (Last 6 Months)</h2>
        <div *ngIf="monthlySales.length > 0" class="chart-container">
          <div class="bar-chart">
            <div *ngFor="let sale of monthlySales" class="bar-wrapper">
              <div class="bar" [style.height.px]="getBarHeight(sale.totalSales)">
                <span class="bar-value">\${{ (sale.totalSales / 1000).toFixed(1) }}K</span>
              </div>
              <div class="bar-label">{{ getMonthLabel(sale.period) }}</div>
            </div>
          </div>
        </div>
        <div *ngIf="loading" class="spinner"></div>
        <p *ngIf="!loading && monthlySales.length === 0">No sales data available.</p>
      </div>

      <!-- Stock Alerts -->
      <div class="card">
        <div class="card-header">
          <h2>Stock Alerts</h2>
          <span class="badge" [class.badge-warning]="stockAlerts.length > 0">
            {{ stockAlerts.length }} Active
          </span>
        </div>
        <table *ngIf="stockAlerts.length > 0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Code</th>
              <th>Current Stock</th>
              <th>Min Level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let alert of stockAlerts">
              <td>{{ alert.productName }}</td>
              <td>{{ alert.productCode }}</td>
              <td [class.danger]="alert.currentStock === 0">{{ alert.currentStock }}</td>
              <td>{{ alert.minStockLevel }}</td>
              <td>
                <span class="badge" [class.badge-danger]="alert.alertType === 'OutOfStock'" [class.badge-warning]="alert.alertType === 'LowStock'">
                  {{ alert.alertType === 'OutOfStock' ? 'Out of Stock' : 'Low Stock' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-success" (click)="resolveAlert(alert.alertId)">Resolve</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="loading" class="spinner"></div>
        <p *ngIf="!loading && stockAlerts.length === 0" class="success-message">
          ✓ All stock levels are good!
        </p>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .stat-card.warning {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
    }

    .card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .card h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      margin: 0;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      color: white;
      background: #95a5a6;
    }

    .badge-warning {
      background: #f39c12;
    }

    .badge-danger {
      background: #e74c3c;
    }

    .revenue {
      font-weight: 600;
      color: #27ae60;
    }

    .danger {
      color: #e74c3c;
      font-weight: 600;
    }

    .chart-container {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 300px;
      gap: 10px;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      justify-content: flex-end;
    }

    .bar {
      width: 100%;
      max-width: 80px;
      background: linear-gradient(180deg, #3498db 0%, #2980b9 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: all 0.3s;
      min-height: 20px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 8px;
    }

    .bar:hover {
      background: linear-gradient(180deg, #2980b9 0%, #21618c 100%);
      transform: translateY(-5px);
    }

    .bar-value {
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .bar-label {
      margin-top: 8px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.85rem;
    }

    .btn-success {
      background: #27ae60;
    }

    .btn-success:hover {
      background: #229954;
    }

    .success-message {
      text-align: center;
      padding: 40px;
      color: #27ae60;
      font-size: 18px;
      font-weight: 600;
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: DashboardStats | null = null;
  topProducts: TopProduct[] = [];
  monthlySales: SalesReport[] = [];
  stockAlerts: StockAlert[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;

    // Load dashboard stats
    this.analyticsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });

    // Load top products
    this.analyticsService.getTopProducts(30).subscribe({
      next: (products) => {
        this.topProducts = products.slice(0, 10); // Top 10
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading top products:', error);
        this.loading = false;
      }
    });

    // Load monthly sales
    this.analyticsService.getMonthlySales(6).subscribe({
      next: (sales) => {
        this.monthlySales = sales.reverse(); // Show oldest to newest
      },
      error: (error) => {
        console.error('Error loading monthly sales:', error);
      }
    });

    // Load stock alerts
    this.analyticsService.getStockAlerts(true).subscribe({
      next: (alerts) => {
        this.stockAlerts = alerts;
      },
      error: (error) => {
        console.error('Error loading stock alerts:', error);
      }
    });
  }

  getBarHeight(value: number): number {
    const maxValue = Math.max(...this.monthlySales.map(s => s.totalSales), 1);
    return Math.max((value / maxValue) * 250, 20); // Min height 20px, max 250px
  }

  getMonthLabel(period: string): string {
    // Expect format like "2024-01" or similar
    const parts = period.split('-');
    if (parts.length >= 2) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = parseInt(parts[1]) - 1;
      return monthNames[monthIndex] || period;
    }
    return period;
  }

  resolveAlert(alertId: number): void {
    if (confirm('Mark this alert as resolved?')) {
      this.analyticsService.resolveStockAlert(alertId).subscribe({
        next: () => {
          this.stockAlerts = this.stockAlerts.filter(a => a.alertId !== alertId);
          alert('Alert resolved successfully!');
        },
        error: (error) => {
          console.error('Error resolving alert:', error);
          alert('Failed to resolve alert');
        }
      });
    }
  }
}
