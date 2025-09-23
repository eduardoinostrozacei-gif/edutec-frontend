import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
  private readonly base = environment.api;
  constructor(private http: HttpClient) {}

  listar(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Aula>>(`${this.base}/aulas`, { params });
  }

  obtener(id: number) {
    return this.http.get<Aula>(`${this.base}/aulas/${id}`);
  }

  crear(aula: Aula) {
    return this.http.post<Aula>(`${this.base}/aulas`, aula);
  }

  actualizar(id: number, aula: Aula) {
    return this.http.put<Aula>(`${this.base}/aulas/${id}`, aula);
  }

  eliminar(id: number) {
    return this.http.delete(`${this.base}/aulas/${id}`);
  }
}
