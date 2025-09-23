import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TipoRecurso {
  idTipoRecurso: number;
  nombre: string;
}

export interface Recurso {
  idRecurso: number;
  nombre: string;
  tipoRecurso: TipoRecurso;
  aula: { idAula: number; nombre?: string; capacidad?: number; };
}

@Injectable({ providedIn: 'root' })
export class AdminCatalogoService {
  private readonly base = environment.api; 

  constructor(private http: HttpClient) {}

  // ===== Tipos de Recurso (admin) =====
  listarTiposRecurso(): Observable<TipoRecurso[]> {
    return this.http.get<TipoRecurso[]>(`${this.base}/admin/tipos-recurso`);
  }

  crearTipoRecurso(nombre: string): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/tipos-recurso`, { nombre });
  }

  actualizarTipoRecurso(id: number, nombre: string): Observable<any> {
    return this.http.put<any>(`${this.base}/admin/tipos-recurso/${id}`, { nombre });
  }

  eliminarTipoRecurso(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/admin/tipos-recurso/${id}`);
  }

  // ===== Recursos por aula (admin) =====
  listarRecursosPorAula(idAula: number): Observable<Recurso[]> {
    const params = new HttpParams().set('idAula', idAula);
    return this.http.get<Recurso[]>(`${this.base}/admin/recursos`, { params });
  }

  crearRecurso(body: { nombre: string; idTipoRecurso: number; idAula: number; }): Observable<any> {
    return this.http.post<any>(`${this.base}/admin/recursos`, body);
  }

  actualizarRecurso(idRecurso: number, body: { nombre?: string; idTipoRecurso?: number; idAula?: number; }): Observable<any> {
    return this.http.put<any>(`${this.base}/admin/recursos/${idRecurso}`, body);
  }

  eliminarRecurso(idRecurso: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/admin/recursos/${idRecurso}`);
  }
}
