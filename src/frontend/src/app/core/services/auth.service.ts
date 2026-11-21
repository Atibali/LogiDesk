import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = 'http://localhost:5000/api/auth';
  private readonly TOKEN_KEY = 'logidesk_token';
  private readonly USER_KEY = 'logidesk_user';

  // Reactive state using Angular Signals
  readonly currentUser = signal<User | null>(this.getInitialUser());
  readonly token = signal<string | null>(this.getInitialToken());

  // Computed state
  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'Administrator');
  readonly isManager = computed(() => this.currentUser()?.role === 'OperationsManager');
  readonly isAgent = computed(() => this.currentUser()?.role === 'SupportAgent');
  readonly isCustomer = computed(() => this.currentUser()?.role === 'Customer');

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => this.setSession(response))
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>('http://localhost:5000/api/users/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  private setSession(authResponse: AuthResponse): void {
    this.token.set(authResponse.token);
    this.currentUser.set(authResponse.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, authResponse.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    }
  }

  private getInitialToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getInitialUser(): User | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
