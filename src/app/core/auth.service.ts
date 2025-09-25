import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  // ajusta según lo que devuelve tu backend
  token?: string;
  mensaje?: string;
  // ...otros campos
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl; // ej: https://edutec-backend.onrender.com/api

  constructor(private http: HttpClient) {}

  /**
   * POST /api/auth/login
   * body: { correo, contrasena }
   */
  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, body, {
      // Ponlo en true SOLO si tu backend usa cookies (Set-Cookie). Si devuelves JWT en JSON, déjalo en false.
      withCredentials: false
    });
  }

  // agrega otros métodos si los necesitas:
  // register(...) { return this.http.post(`${this.baseUrl}/auth/register`, body); }
  // refresh(...)  { return this.http.post(`${this.baseUrl}/auth/refresh`, {}); }
}
