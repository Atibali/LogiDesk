import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="welcome-banner card">
        <div class="banner-content">
          <div>
            <div class="badge-role-row">
              <span class="badge" [ngClass]="getRoleBadgeClass(authService.currentUser()?.role)">
                {{ authService.currentUser()?.role }}
              </span>
              <span class="badge badge-active">Active Session</span>
            </div>
            <h2>Hello, {{ authService.currentUser()?.name }}!</h2>
            <p class="banner-subtext">Signed in as <strong>{{ authService.currentUser()?.email }}</strong></p>
          </div>
          <div class="banner-actions">
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="btn btn-primary">Open User Management →</a>
            }
          </div>
        </div>
      </div>

      <div class="role-grid">
        <!-- Customer View -->
        @if (authService.isCustomer()) {
          <div class="card stat-card">
            <h3>My Support Tickets</h3>
            <p>Track your reported shipment issues and updates.</p>
            <div class="stat-highlight">0 Active Tickets</div>
            <span class="stat-footer">Ready for Epic 4 ticket creation</span>
          </div>

          <div class="card stat-card">
            <h3>My Shipments</h3>
            <p>View packages linked to your customer profile.</p>
            <div class="stat-highlight">Tracking Active</div>
            <span class="stat-footer">Ready for Epic 3 shipment reference</span>
          </div>
        }

        <!-- Support Agent View -->
        @if (authService.isAgent()) {
          <div class="card stat-card">
            <h3>Assigned Queue</h3>
            <p>Shipment inquiries and escalations assigned to you.</p>
            <div class="stat-highlight">Agent Queue Ready</div>
            <span class="stat-footer">Awaiting dispatcher assignment</span>
          </div>

          <div class="card stat-card">
            <h3>Customer Comments</h3>
            <p>Respond to customer inquiries and add internal notes.</p>
            <div class="stat-highlight">Channel Open</div>
            <span class="stat-footer">Ready for Epic 6 communication</span>
          </div>
        }

        <!-- Operations Manager View -->
        @if (authService.isManager()) {
          <div class="card stat-card">
            <h3>Dispatch Overview</h3>
            <p>Assign open tickets to available support agents.</p>
            <div class="stat-highlight">Assignment Console</div>
            <span class="stat-footer">Ready for Epic 5 workflow</span>
          </div>

          <div class="card stat-card">
            <h3>SLA Performance</h3>
            <p>Monitor resolution timelines and status shifts.</p>
            <div class="stat-highlight">All Systems Normal</div>
            <span class="stat-footer">Ready for Epic 7 reporting</span>
          </div>
        }

        <!-- Administrator View -->
        @if (authService.isAdmin()) {
          <div class="card stat-card">
            <!-- <div class="stat-icon">👥</div> -->
            <h3>User Administration</h3>
            <p>Manage accounts, assign roles, and toggle user activation.</p>
            <div class="stat-highlight">Full RBAC Control</div>
            <span class="stat-footer">Active & ready</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .welcome-banner {
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #ffffff 0%, var(--primary-50) 100%);
      border-left: 5px solid var(--primary-600);
    }

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .badge-role-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .welcome-banner h2 {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }

    .banner-subtext {
      color: var(--slate-600);
      font-size: 0.9375rem;
    }

    .role-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .stat-card h3 {
      font-size: 1.125rem;
      margin-bottom: 0.375rem;
    }

    .stat-card p {
      color: var(--slate-600);
      font-size: 0.875rem;
      margin-bottom: 1rem;
      flex-grow: 1;
    }

    .stat-highlight {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary-700);
      margin-bottom: 0.25rem;
    }

    .stat-footer {
      font-size: 0.75rem;
      color: var(--slate-400);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .session-card h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
    }

    .claims-table-wrapper {
      margin-top: 0.5rem;
    }
  `]
})
export class DashboardComponent {
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
