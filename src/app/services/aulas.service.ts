import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { apiUrl } from '../core/api-url.util';

export interface Aula {
  idAula?: number;
  nombre: string;
  capacidad: number;
  ubicacion?: string;
  idTipoAula: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class AulasService {
  constructor(private http: HttpClient) {}

  listar(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Aula>>(apiUrl('/aulas'), { params });
  }

  obtener(id: number) {
    return this.http.get<Aula>(apiUrl(`/aulas/${id}`));
  }

  crear(aula: Aula) {
    return this.http.post<Aula>(apiUrl('/aulas'), aula);
  }

  actualizar(id: number, aula: Aula) {
    return this.http.put<Aula>(apiUrl(`/aulas/${id}`), aula);
  }

  eliminar(id: number) {
    return this.http.delete(apiUrl(`/aulas/${id}`));
  }
}
