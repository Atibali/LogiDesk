import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>User Management Console</h2>
          <p class="admin-subtext">Manage system users, assign role privileges, and control account activation status.</p>
        </div>
        <button class="btn btn-outline" (click)="loadUsers()" [disabled]="loading()">
          🔄 Refresh Users
        </button>
      </div>

      @if (alertMessage()) {
        <div class="alert" [ngClass]="alertType() === 'success' ? 'alert-success' : 'alert-danger'">
          <span>{{ alertMessage() }}</span>
          <button type="button" class="close-alert" (click)="alertMessage.set('')">✕</button>
        </div>
      }

      <!-- Search and Filter Bar -->
      <div class="card filter-card">
        <div class="filter-row">
          <div class="search-box">
            <label class="form-label">Search Users</label>
            <input
              type="text"
              class="form-input"
              placeholder="Filter by name or email..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
            />
          </div>
          <div class="role-filter">
            <label class="form-label">Filter by Role</label>
            <select
              class="form-select"
              [ngModel]="selectedRoleFilter()"
              (ngModelChange)="selectedRoleFilter.set($event)"
            >
              <option value="">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="SupportAgent">Support Agent</option>
              <option value="OperationsManager">Operations Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Current Role</th>
              <th>Change Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (loading() && users().length === 0) {
              <tr>
                <td colspan="6" class="text-center py-4">Loading user records...</td>
              </tr>
            } @else if (filteredUsers().length === 0) {
              <tr>
                <td colspan="6" class="text-center py-4">No users match your criteria.</td>
              </tr>
            } @else {
              @for (user of filteredUsers(); track user.userId) {
                <tr>
                  <td><strong>#{{ user.userId }}</strong></td>
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                      <div>
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <select
                      class="form-select select-sm"
                      [ngModel]="user.role"
                      [disabled]="updatingUserId() === user.userId"
                      (ngModelChange)="onRoleChange(user, $event)"
                    >
                      <option value="Customer">Customer</option>
                      <option value="SupportAgent">SupportAgent</option>
                      <option value="OperationsManager">OperationsManager</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="user.isActive ? 'badge-active' : 'badge-inactive'">
                      {{ user.isActive ? 'Active' : 'Deactivated' }}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-sm"
                      [ngClass]="user.isActive ? 'btn-danger' : 'btn-primary'"
                      [disabled]="updatingUserId() === user.userId || isSelf(user)"
                      (click)="toggleStatus(user)"
                    >
                      @if (updatingUserId() === user.userId) {
                        <span>Updating...</span>
                      } @else {
                        <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
                      }
                    </button>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .admin-header h2 {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }

    .admin-subtext {
      color: var(--slate-600);
      font-size: 0.9375rem;
    }

    .filter-card {
      margin-bottom: 1.5rem;
      padding: 1rem 1.25rem;
    }

    .filter-row {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1 1 300px;
    }

    .role-filter {
      flex: 0 1 220px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--primary-100);
      color: var(--primary-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .user-name {
      font-weight: 600;
      color: var(--slate-900);
    }

    .user-email {
      font-size: 0.8125rem;
      color: var(--slate-500);
    }

    .select-sm {
      padding: 0.35rem 0.5rem;
      font-size: 0.8125rem;
      width: auto;
      min-width: 140px;
    }

    .btn-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
    }

    .text-center {
      text-align: center;
    }

    .py-4 {
      padding: 1.5rem 0;
    }

    .close-alert {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.875rem;
    }
  `]
})
export class AdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly updatingUserId = signal<number | null>(null);
  readonly alertMessage = signal('');
  readonly alertType = signal<'success' | 'danger'>('success');
  readonly searchQuery = signal('');
  readonly selectedRoleFilter = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.showAlert(err?.error?.message || 'Failed to fetch user list.', 'danger');
      }
    });
  }

  filteredUsers(): User[] {
    const query = this.searchQuery().toLowerCase().trim();
    const roleFilter = this.selectedRoleFilter();

    return this.users().filter(u => {
      const matchesSearch = !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  onRoleChange(user: User, newRole: string): void {
    if (user.role === newRole) return;

    this.updatingUserId.set(user.userId);
    this.adminService.updateUserRole(user.userId, newRole).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.userId === updated.userId ? updated : u));
        this.updatingUserId.set(null);
        this.showAlert(`Updated role for ${updated.name} to ${updated.role}`, 'success');
      },
      error: (err) => {
        this.updatingUserId.set(null);
        this.showAlert(err?.error?.message || 'Failed to update user role.', 'danger');
      }
    });
  }

  toggleStatus(user: User): void {
    const nextStatus = !user.isActive;
    this.updatingUserId.set(user.userId);

    this.adminService.updateUserStatus(user.userId, nextStatus).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.userId === updated.userId ? updated : u));
        this.updatingUserId.set(null);
        this.showAlert(`User ${updated.name} has been ${updated.isActive ? 'activated' : 'deactivated'}.`, 'success');
      },
      error: (err) => {
        this.updatingUserId.set(null);
        this.showAlert(err?.error?.message || 'Failed to update user status.', 'danger');
      }
    });
  }

  isSelf(user: User): boolean {
    return user.userId === this.authService.currentUser()?.userId;
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'Administrator': return 'badge-admin';
      case 'OperationsManager': return 'badge-manager';
      case 'SupportAgent': return 'badge-agent';
      default: return 'badge-customer';
    }
  }

  private showAlert(message: string, type: 'success' | 'danger'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
  }
}
