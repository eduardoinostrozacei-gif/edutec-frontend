import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiUrl } from '../core/api-url.util';

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
  constructor(private http: HttpClient) {}

  listar(aulaId?: number) {
    let params = new HttpParams();
    if (aulaId != null) params = params.set('aulaId', aulaId);
    return this.http.get<Recurso[]>(apiUrl('/recursos'), { params });
  }

  obtener(id: number) {
    return this.http.get<Recurso>(apiUrl(`/recursos/${id}`));
  }

  crear(r: Recurso) {
    const body = { nombre: r.nombre, idTipoRecurso: r.idTipoRecurso, idAula: r.idAula };
    return this.http.post<Recurso>(apiUrl('/recursos'), body);
  }

  actualizar(id: number, r: Recurso) {
    const body = { nombre: r.nombre, idTipoRecurso: r.idTipoRecurso, idAula: r.idAula };
    return this.http.put<Recurso>(apiUrl(`/recursos/${id}`), body);
  }

  eliminar(id: number) {
    return this.http.delete(apiUrl(`/recursos/${id}`));
  }

  listarTipos() {
    return this.http.get<TipoRecurso[]>(apiUrl('/tipos-recurso'));
  }
}
