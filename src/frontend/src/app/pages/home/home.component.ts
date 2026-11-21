import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <section class="hero-section">
        <div class="badge hero-badge">Logistics Support Platform</div>
        <h1 class="hero-title">Centralized HelpDesk for Fast Logistics Resolution</h1>
        <p class="hero-subtitle">
          Say goodbye to untracked email chains and lost packages. LogiDesk coordinates customer shipment issues, agent investigations, and operational assignments under a single auditable workflow.
        </p>

        <div class="hero-cta">
          @if (!authService.isAuthenticated()) {
            <a routerLink="/register" class="btn btn-primary btn-lg">Get Started Free</a>
            <a routerLink="/login" class="btn btn-outline btn-lg">Sign In to Account</a>
          } @else {
            <a routerLink="/dashboard" class="btn btn-primary btn-lg">Go to Workspace</a>
          }
        </div>
      </section>

      <section class="features-grid">
        <div class="card feature-card">
          <h3>Role-Based Access</h3>
          <p>Strict access controls tailored for Customers, Support Agents, Operations Managers, and Administrators.</p>
        </div>

        <div class="card feature-card">
          <h3>Shipment Integration</h3>
          <p>Link support requests directly to tracking IDs, package details, and estimated delivery dates.</p>
        </div>

        <div class="card feature-card">
          <h3>Auditable Lifecycles</h3>
          <p>Every assignment, status shift from OPEN to RESOLVED, and communication is permanently timestamped.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 4rem;
    }

    .hero-badge {
      background: var(--primary-100);
      color: var(--primary-700);
      margin-bottom: 1rem;
    }

    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--slate-900);
      margin-bottom: 1.25rem;
      line-height: 1.15;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--slate-600);
      max-width: 700px;
      margin: 0 auto 2rem auto;
    }

    .hero-cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-lg {
      padding: 0.75rem 1.75rem;
      font-size: 1rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3.5rem;
    }

    .feature-card {
      text-align: left;
    }

    .feature-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: var(--slate-600);
      font-size: 0.9375rem;
      line-height: 1.5;
    }

    .demo-box {
      background: #ffffff;
      border-left: 4px solid var(--primary-600);
    }

    .demo-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .demo-content h3 {
      font-size: 1.125rem;
      margin-bottom: 0.25rem;
    }

    .demo-content p {
      color: var(--slate-600);
      font-size: 0.875rem;
    }
  `]
})
export class HomeComponent {
  readonly authService = inject(AuthService);
}
