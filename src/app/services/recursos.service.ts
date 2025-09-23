import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Recurso {
  idRecurso?: number;
  nombre: string;
  idTipoRecurso: number;
  idAula: number;
  aulaNombre?: string;
  tipoNombre?: string;
}

export interface TipoRecurso {
  idTipoRecurso: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class RecursosService {
  private readonly base = environment.api;
  constructor(private http: HttpClient) {}

  listar(aulaId?: number) {
    let params = new HttpParams();
    if (aulaId) params = params.set('aulaId', aulaId);
    return this.http.get<Recurso[]>(`${this.base}/recursos`, { params });
  }

  obtener(id: number) {
    return this.http.get<Recurso>(`${this.base}/recursos/${id}`);
  }

  crear(r: Recurso) {
    const body = { nombre: r.nombre, idTipoRecurso: r.idTipoRecurso, idAula: r.idAula };
    return this.http.post<Recurso>(`${this.base}/recursos`, body);
  }

  actualizar(id: number, r: Recurso) {
    const body = { nombre: r.nombre, idTipoRecurso: r.idTipoRecurso, idAula: r.idAula };
    return this.http.put<Recurso>(`${this.base}/recursos/${id}`, body);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.base}/recursos/${id}`);
  }

  listarTipos() {
    return this.http.get<TipoRecurso[]>(`${this.base}/tipos-recurso`);
  }
}
