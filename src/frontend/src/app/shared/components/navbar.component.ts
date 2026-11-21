import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">
          <div class="brand-icon">📦</div>
          <span class="brand-name">Logi<span>Desk</span></span>
        </a>

        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
          
          @if (authService.isAuthenticated()) {
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            
            @if (authService.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active" class="nav-link">User Management</a>
            }
          }
        </nav>

        <div class="nav-auth">
          @if (authService.isAuthenticated()) {
            <div class="user-pill">
              <span class="user-greeting">{{ authService.currentUser()?.name }}</span>
              <span class="badge" [ngClass]="getRoleBadgeClass(authService.currentUser()?.role)">
                {{ authService.currentUser()?.role }}
              </span>
            </div>
            <button class="btn btn-outline btn-sm" (click)="authService.logout()">Logout</button>
          } @else {
            <a routerLink="/login" class="btn btn-outline btn-sm">Login</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Register</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid var(--slate-200);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.875rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
    }

    .brand-icon {
      font-size: 1.5rem;
      background: var(--primary-50);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
    }

    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.03em;
    }

    .brand-name span {
      color: var(--primary-600);
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-link {
      color: var(--slate-600);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9375rem;
      padding: 0.375rem 0.25rem;
      position: relative;
      transition: color 0.15s ease;
    }

    .nav-link:hover, .nav-link.active {
      color: var(--primary-600);
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -0.875rem;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--primary-600);
    }

    .nav-auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--slate-100);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid var(--slate-200);
    }

    .user-greeting {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--slate-700);
    }

    .btn-sm {
      padding: 0.375rem 0.875rem;
      font-size: 0.8125rem;
    }
  `]
})
export class NavbarComponent {
  readonly authService = inject(AuthService);

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'Administrator': return 'badge-admin';
      case 'OperationsManager': return 'badge-manager';
      case 'SupportAgent': return 'badge-agent';
      default: return 'badge-customer';
    }
  }
}
