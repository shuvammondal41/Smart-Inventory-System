import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardStats, StockAlert } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1 class="page-title">Dashboard</h1>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card blue">
          <div class="stat-label">Today's Sales</div>
          <div class="stat-value">\${{ stats.todaySales.toFixed(2) }}</div>
        </div>

        <div class="stat-card green">
          <div class="stat-label">Month Sales</div>
          <div class="stat-value">\${{ stats.monthSales.toFixed(2) }}</div>
        </div>

        <div class="stat-card orange">
          <div class="stat-label">Total Products</div>
          <div class="stat-value">{{ stats.totalProducts }}</div>
        </div>

        <div class="stat-card red">
          <div class="stat-label">Low Stock Items</div>
          <div class="stat-value">{{ stats.lowStockProductsCount }}</div>
        </div>

        <div class="stat-card blue">
          <div class="stat-label">Today's Invoices</div>
          <div class="stat-value">{{ stats.todayInvoices }}</div>
        </div>

        <div class="stat-card green">
          <div class="stat-label">Total Customers</div>
          <div class="stat-value">{{ stats.totalCustomers }}</div>
        </div>

        <div class="stat-card orange">
          <div class="stat-label">Active Alerts</div>
          <div class="stat-value">{{ stats.activeAlerts }}</div>
        </div>
      </div>

      <div class="card" *ngIf="alerts && alerts.length > 0">
        <h2 class="card-header">Stock Alerts</h2>
        <div class="alert-list">
          <div class="alert-item" *ngFor="let alert of alerts">
            <div class="alert-content">
              <h4>{{ alert.productName }} ({{ alert.productCode }})</h4>
              <p>{{ alert.alertMessage }}</p>
              <p class="alert-meta">
                Stock: {{ alert.currentStock }} / Min: {{ alert.minStockLevel }}
                | {{ alert.createdAt | date: 'short' }}
              </p>
            </div>
            <button class="btn btn-sm btn-success" (click)="resolveAlert(alert.alertId)">
              Resolve
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="spinner"></div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 2rem;
      margin-bottom: 30px;
      color: #2c3e50;
    }

    .alert-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 5px;
    }

    .alert-content h4 {
      margin: 0 0 5px 0;
      color: #856404;
    }

    .alert-content p {
      margin: 5px 0;
      color: #856404;
    }

    .alert-meta {
      font-size: 0.85rem;
      opacity: 0.8;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  stats: DashboardStats | null = null;
  alerts: StockAlert[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadData();
  }

  // load dashboard stats and alerts
  loadData(): void {
    this.loading = true;

    this.analyticsService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
        console.log('dashboard loaded:', stats); // debug
      },
      error: (error) => {
        console.error('failed to load dashboard:', error);
        alert('Failed to load dashboard'); // TODO: use toast
        this.loading = false;
      }
    });

    // get active alerts only
    this.analyticsService.getStockAlerts(true).subscribe({
      next: (alerts) => {
        this.alerts = alerts.slice(0, 5); // top 5 only
        console.log('alerts loaded:', alerts.length); // debug
      },
      error: (error) => {
        console.error('failed to load alerts:', error);
      }
    });
  }

  // mark alert as resolved
  resolveAlert(alertId: number): void {
    this.analyticsService.resolveStockAlert(alertId).subscribe({
      next: () => {
        this.alerts = this.alerts.filter(a => a.alertId !== alertId);
        this.loadData(); // refresh
        console.log('alert resolved:', alertId); // debug
      },
      error: (error) => {
        console.error('failed to resolve alert:', error);
        alert('Failed to resolve alert');
      }
    });
  }
}
