import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Smart Inventory & Billing</h1>
        <h2>Login</h2>

        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="credentials.username"
              class="form-control"
              required
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              class="form-control"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            [disabled]="!loginForm.form.valid || loading"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: <code>admin</code> | Password: <code>Admin&#64;123</code></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      font-size: 1.5rem;
      color: #667eea;
      margin-bottom: 10px;
      text-align: center;
    }

    h2 {
      font-size: 1.8rem;
      margin-bottom: 30px;
      text-align: center;
      color: #2c3e50;
    }

    .btn-block {
      width: 100%;
      margin-top: 10px;
    }

    .demo-credentials {
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .demo-credentials p {
      margin: 5px 0;
    }

    .demo-credentials code {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    username: '',
    password: ''
  };

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
