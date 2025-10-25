import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="logo">
          <h2>Smart Inventory</h2>
        </div>

        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span>📊</span> Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/products" routerLinkActive="active">
              <span>📦</span> Products
            </a>
          </li>
          <li>
            <a routerLink="/inventory" routerLinkActive="active">
              <span>📋</span> Inventory
            </a>
          </li>
          <li>
            <a routerLink="/billing" routerLinkActive="active">
              <span>💰</span> New Sale
            </a>
          </li>
          <li>
            <a routerLink="/invoices" routerLinkActive="active">
              <span>📄</span> Invoices
            </a>
          </li>
          <li>
            <a routerLink="/customers" routerLinkActive="active">
              <span>👥</span> Customers
            </a>
          </li>
          <li>
            <a routerLink="/analytics" routerLinkActive="active">
              <span>📈</span> Analytics
            </a>
          </li>
        </ul>

        <div class="user-info" *ngIf="currentUser$ | async as user">
          <p><strong>{{ user.fullName }}</strong></p>
          <p class="role">{{ user.role }}</p>
          <button class="btn btn-danger btn-sm" (click)="logout()">Logout</button>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 250px;
      background: #0a1f2e;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
      border-right: 1px solid #1a3a4d;
    }

    .logo {
      padding: 25px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logo h2 {
      margin: 0;
      font-size: 1.2rem;
      color: #e0e0e0;
      font-weight: 400;
    }

    .nav-menu {
      list-style: none;
      padding: 20px 0;
      flex: 1;
    }

    .nav-menu li {
      margin-bottom: 5px;
    }

    .nav-menu a {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      font-size: 0.95rem;
    }

    .nav-menu a span {
      margin-right: 12px;
      font-size: 1.1rem;
    }

    .nav-menu a:hover {
      background: rgba(243, 156, 18, 0.05);
      color: #f39c12;
    }

    .nav-menu a.active {
      background: rgba(243, 156, 18, 0.1);
      color: #f39c12;
      border-left-color: #f39c12;
    }

    .user-info {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(0, 0, 0, 0.2);
    }

    .user-info p {
      margin: 5px 0;
      color: #e0e0e0;
    }

    .user-info p:first-child {
      color: #f39c12;
      font-size: 0.9rem;
    }

    .user-info .role {
      font-size: 0.8rem;
      opacity: 0.6;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-info .btn-sm {
      font-size: 0.85rem;
      padding: 8px 15px;
      width: 100%;
    }

    .main-content {
      flex: 1;
      margin-left: 250px;
      padding: 30px;
      background: #0a1f2e;
      min-height: 100vh;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 70px;
      }

      .sidebar .logo h2,
      .sidebar .nav-menu a span + *,
      .sidebar .user-info {
        display: none;
      }

      .main-content {
        margin-left: 70px;
      }
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
  }
}
