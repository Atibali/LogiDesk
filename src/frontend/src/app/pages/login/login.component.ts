import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <div class="auth-icon">🔐</div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your LogiDesk workspace</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger">
            <span>{{ errorMessage() }}</span>
            <button type="button" class="close-alert" (click)="errorMessage.set('')">✕</button>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="e.g. user@logidesk.com"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <div class="invalid-feedback">
                @if (loginForm.get('email')?.hasError('required')) {
                  Email is required.
                } @else if (loginForm.get('email')?.hasError('email')) {
                  Enter a valid email address.
                }
              </div>
            }
          </div>

          <div class="form-group">
            <div class="password-label-row">
              <label class="form-label" for="password">Password</label>
              <button
                type="button"
                class="toggle-password-btn"
                (click)="showPassword.set(!showPassword())"
              >
                {{ showPassword() ? 'Hide' : 'Show' }}
              </button>
            </div>
            <input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="••••••••"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <div class="invalid-feedback">Password is required.</div>
            }
          </div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
            @if (loading()) {
              <span>Signing In...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Don't have an account?</span>
          <a routerLink="/register">Create customer account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .auth-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .auth-header h2 {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }

    .auth-header p {
      color: var(--slate-500);
      font-size: 0.875rem;
    }

    .password-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toggle-password-btn {
      background: none;
      border: none;
      color: var(--primary-600);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.75rem;
    }

    .close-alert {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .quick-fill-section {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px dashed var(--slate-200);
    }

    .quick-fill-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--slate-500);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .quick-fill-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .chip {
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chip-admin {
      background: #f3e8ff;
      color: #6b21a8;
      border-color: #e9d5ff;
    }

    .chip-manager {
      background: #fef3c7;
      color: #92400e;
      border-color: #fde68a;
    }

    .chip-agent {
      background: #dbeafe;
      color: #1e40af;
      border-color: #bfdbfe;
    }

    .chip-customer {
      background: #e0e7ff;
      color: #3730a3;
      border-color: #c7d2fe;
    }

    .chip:hover {
      filter: brightness(0.95);
      transform: translateY(-1px);
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--slate-600);
      display: flex;
      justify-content: center;
      gap: 0.375rem;
    }

    .auth-footer a {
      color: var(--primary-600);
      font-weight: 600;
      text-decoration: none;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  quickFill(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
    this.errorMessage.set('');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }
}
