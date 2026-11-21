import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateRoleRequest, UpdateStatusRequest, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5000/api/admin';

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<User> {
    const payload: UpdateStatusRequest = { isActive };
    return this.http.put<User>(`${this.API_URL}/users/${userId}/status`, payload);
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    const payload: UpdateRoleRequest = { role };
    return this.http.put<User>(`${this.API_URL}/users/${userId}/role`, payload);
  }
}
