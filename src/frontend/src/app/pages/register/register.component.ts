import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value
    ? { passwordMismatch: true }
    : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <div class="auth-header">
          <div class="auth-icon">📝</div>
          <h2>Create Customer Account</h2>
          <p>Register to submit and track your shipment support tickets</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger">
            <span>{{ errorMessage() }}</span>
            <button type="button" class="close-alert" (click)="errorMessage.set('')">✕</button>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="name">Full Name</label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="e.g. John Doe"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('name')"
            />
            @if (isFieldInvalid('name')) {
              <div class="invalid-feedback">
                @if (registerForm.get('name')?.hasError('required')) {
                  Full name is required.
                } @else if (registerForm.get('name')?.hasError('minlength')) {
                  Name must be at least 2 characters.
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="e.g. john.doe@example.com"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <div class="invalid-feedback">
                @if (registerForm.get('email')?.hasError('required')) {
                  Email is required.
                } @else if (registerForm.get('email')?.hasError('email')) {
                  Please provide a valid email address.
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="At least 6 characters"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <div class="invalid-feedback">
                @if (registerForm.get('password')?.hasError('required')) {
                  Password is required.
                } @else if (registerForm.get('password')?.hasError('minlength')) {
                  Password must be at least 6 characters long.
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Re-type password"
              class="form-input"
              [class.is-invalid]="isFieldInvalid('confirmPassword') || (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched)"
            />
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <div class="invalid-feedback">Passwords do not match.</div>
            }
          </div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
            @if (loading()) {
              <span>Creating Account...</span>
            } @else {
              <span>Register Account</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          <span>Already registered?</span>
          <a routerLink="/login">Sign in</a>
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
