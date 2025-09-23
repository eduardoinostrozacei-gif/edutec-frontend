import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface TokenDTO { token: string; }
export interface MeDTO { usuario: string; authorities: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.api;
  private readonly KEY = 'auth_token';
  private rolesCache: string[] = []; // nunca null

  constructor(private http: HttpClient) {}

  // --- Auth básica ---
  async login(body: { correo: string; contrasena: string; }): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<TokenDTO>(`${this.base}/auth/login`, body)
    );
    localStorage.setItem(this.KEY, res.token);
    this.rolesCache = [];
    await this.refreshRoles();
  }

  logout(){
    localStorage.removeItem(this.KEY);
    this.rolesCache = [];
  }

  isLogged(){ return !!localStorage.getItem(this.KEY); }
  get token(): string | null { return localStorage.getItem(this.KEY); }

  // --- Roles ---
  async refreshRoles(): Promise<string[]> {
    if (!this.isLogged()) { this.rolesCache = []; return []; }
    const me = await firstValueFrom(this.http.get<MeDTO>(`${this.base}/me`));
    this.rolesCache = me?.authorities ?? [];
    return this.rolesCache;
  }

  getRoles(): string[] { return this.rolesCache; }

  async ensureRoles(): Promise<string[]> {
    if (this.rolesCache.length === 0 && this.isLogged()) {
      await this.refreshRoles();
    }
    return this.rolesCache;
  }

  // --- Helpers de permiso ---
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
