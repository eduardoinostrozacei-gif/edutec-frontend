import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/api-url.util';

export interface Aula {
  idAula: number;
  nombre: string;
  capacidad: number;
  ubicacion?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ReservaItem {
  idReserva: number;
  aulaId: number;
  aulaNombre: string;
  fecha: string;       // YYYY-MM-DD
  horaInicio: string;  // HH:mm
  horaFin: string;     // HH:mm
  estado: string;
  usuarioCorreo: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface DisponibilidadResp {
  disponible: boolean;
  mensaje: string;
}

export interface ReporteUsoAula {
  aulaId: number;
  aulaNombre: string;
  minutosReservados: number;
}

export interface ReporteEstadoMes {
  estado: string;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  constructor(private http: HttpClient) {}

  listarAulas(page = 0, size = 50): Observable<Page<Aula>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Aula>>(apiUrl('/aulas'), { params });
  }

  listarMias(page = 0, size = 10): Observable<PageResponse<ReservaItem>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ReservaItem>>(apiUrl('/reservas-query/mias/page'), { params });
  }

  listarMiasPage(page = 0, size = 10): Observable<PageResponse<ReservaItem>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ReservaItem>>(apiUrl('/reservas-query/mias/page'), { params });
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`/reservas/${id}`));
  }

  disponible(
    idAula: number,
    fecha: string,
    inicio: string,
    fin: string,
    idReservaExcl?: number
  ): Observable<DisponibilidadResp> {
    let params = new HttpParams()
      .set('idAula', idAula)
      .set('fecha', fecha)
      .set('inicio', inicio)
      .set('fin', fin);

    if (idReservaExcl != null) {
      params = params.set('idReservaExcl', idReservaExcl);
    }

    return this.http.get<DisponibilidadResp>(apiUrl('/reservas/disponible'), { params });
  }

  crear(body: { idAula: number; fecha: string; horaInicio: string; horaFin: string })
    : Observable<{ id_reserva: number; estado: string; mensaje: string }> {
    return this.http.post<{ id_reserva: number; estado: string; mensaje: string }>(
      apiUrl('/reservas'),
      body
    );
  }

  listarPorFechaAula(fecha: string, idAula: number, page = 0, size = 20)
    : Observable<PageResponse<ReservaItem>> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('idAula', idAula)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<ReservaItem>>(apiUrl('/reservas-query/listar'), { params });
  }

  usoAulas(desde: string, hasta: string): Observable<ReporteUsoAula[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ReporteUsoAula[]>(apiUrl('/reportes/uso-aulas'), { params });
  }

  estadosMes(desde: string, hasta: string): Observable<ReporteEstadoMes[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http.get<ReporteEstadoMes[]>(apiUrl('/reportes/estados-mes'), { params });
  }

  updateHorario(id: number, horaInicio: string, horaFin: string)
    : Observable<{ id_reserva: number; hora_inicio: string; hora_fin: string; mensaje: string }> {
    return this.http.put<{ id_reserva: number; hora_inicio: string; hora_fin: string; mensaje: string }>(
      apiUrl(`/reservas/${id}`),
      { horaInicio, horaFin }
    );
  }
}
