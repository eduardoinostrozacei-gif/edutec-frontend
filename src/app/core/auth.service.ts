import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url.util';

export interface TokenDTO { token: string; }
export interface MeDTO { usuario: string; authorities: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'auth_token';
  private rolesCache: string[] = [];

  constructor(private http: HttpClient) {}

  async login(body: { correo: string; contrasena: string; }): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<TokenDTO>(apiUrl('/auth/login'), body, {
        withCredentials: false // déjalo false si el backend NO usa cookies httpOnly
      })
    );
    if (!res?.token) throw new Error('No se recibió token del backend');

    localStorage.setItem(this.KEY, res.token);
    this.rolesCache = [];
    await this.refreshRoles();
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    this.rolesCache = [];
  }

  isLogged(): boolean {
    return !!localStorage.getItem(this.KEY);
  }

  get token(): string | null {
    return localStorage.getItem(this.KEY);
  }

  async refreshRoles(): Promise<string[]> {
    if (!this.isLogged()) { this.rolesCache = []; return []; }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    try {
      const me = await firstValueFrom(
        this.http.get<MeDTO>(apiUrl('/auth/me'), { headers })
      );
      this.rolesCache = me?.authorities ?? [];
    } catch {
      // token inválido/expirado => limpiar sesión
      this.logout();
    }
    return this.rolesCache;
  }

  getRoles(): string[] { return this.rolesCache; }

  async ensureRoles(): Promise<string[]> {
    if (this.rolesCache.length === 0 && this.isLogged()) {
      await this.refreshRoles();
    }
    return this.rolesCache;
  }

  isAdmin(): boolean   { return this.getRoles().includes('ROLE_ADMIN'); }
  isDocente(): boolean { return this.getRoles().includes('ROLE_DOCENTE'); }
  isAlumno(): boolean  { return this.getRoles().includes('ROLE_ALUMNO'); }

  hasAnyRole(required: string[]): boolean {
    const mine = this.getRoles();
    return required.some(r => {
      const normalized = r.startsWith('ROLE_') ? r : `ROLE_${r}`;
      return mine.includes(normalized);
    });
  }
}
