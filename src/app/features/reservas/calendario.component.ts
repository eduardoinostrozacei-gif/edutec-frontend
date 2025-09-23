import { Component, OnInit, AfterViewInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';

import { ReservasService, Aula, ReservaItem, PageResponse } from '../../services/reservas.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatSelectModule, MatButtonModule, FullCalendarModule],
  template: `
    <h2>Calendario</h2>

    <mat-card style="padding:12px">
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
        <mat-select placeholder="Aula" [(ngModel)]="aulaSeleccionada" (selectionChange)="refetch()" style="min-width:280px">
          <mat-option *ngFor="let a of aulas" [value]="a.idAula">
            {{a.nombre}} (cap. {{a.capacidad}})
          </mat-option>
        </mat-select>
      </div>
    </mat-card>

    <full-calendar [options]="options"></full-calendar>
  `,
})
export class CalendarioComponent implements OnInit, AfterViewInit {
  @ViewChild(FullCalendarComponent) calendar?: FullCalendarComponent;

  aulas: Aula[] = [];
  aulaSeleccionada: number | null = null;

  canEdit = false;
  canCancel = false;

  private currentRange = { start: '', end: '' };

  private _events = signal<any[]>([]);
  events = this._events;

  options: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: (fetchInfo, success, failure) => this.cargarEventos(fetchInfo, success, failure),
    selectable: true,
    selectMirror: true,
    editable: false,              
    eventDurationEditable: false, 
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    select: (arg: any) => this.onSelect(arg),
    eventClick: (arg: any) => this.onEventClick(arg),
    eventDrop: (arg: any) => this.onEventDrop(arg),
    eventResize: (arg: any) => this.onEventResize(arg),
  };

  constructor(
    private srv: ReservasService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.canEdit   = this.auth.isAdmin();                       
    this.canCancel = this.auth.isAdmin() || this.auth.isDocente(); 

    this.srv.listarAulas(0, 100).subscribe({
      next: p => {
        this.aulas = p.content || [];
        if (!this.aulaSeleccionada && this.aulas.length) {
          this.aulaSeleccionada = this.aulas[0].idAula!;
        }
        setTimeout(() => this.refetch(), 0);
      }
    });
  }

  ngAfterViewInit(): void {
    this.applyEditability();
  }

  private applyEditability() {
    const api = this.calendar?.getApi();
    api?.setOption('editable', this.canEdit);
    api?.setOption('eventDurationEditable', this.canEdit);
    this.options = { ...this.options, editable: this.canEdit, eventDurationEditable: this.canEdit };
  }

  refetch() {
    this.applyEditability();
    this.calendar?.getApi().refetchEvents();
  }


  private cargarEventos(fetchInfo: any, success: (evs: any[]) => void, failure: (err: any) => void) {
    if (!this.aulaSeleccionada) { success([]); return; }

    const start = (fetchInfo?.startStr || '').slice(0, 10);
    const end   = (fetchInfo?.endStr   || '').slice(0, 10);
    this.currentRange = { start, end };

    const fechas = this.enumerarFechas(start, end);
    const peticiones = fechas.map(f => this.srv.listarPorFechaAula(f, this.aulaSeleccionada!, 0, 200).toPromise());

    Promise.all(peticiones)
      .then((respuestas?: (PageResponse<ReservaItem> | undefined)[]) => {
        const items: ReservaItem[] = [];
        (respuestas || []).forEach(r => { if (r?.content?.length) items.push(...r.content); });

        const evs = items.map(r => {
          const start = `${r.fecha}T${this.ensureSeconds(r.horaInicio)}`;
          const end   = `${r.fecha}T${this.ensureSeconds(r.horaFin)}`;
          const color = this.colorPorEstado(r.estado);
          return {
            id: String(r.idReserva),
            title: `${r.aulaNombre} · ${r.estado}`,
            start, end, color,
            extendedProps: {
              idAula: r.aulaId,
              fecha: r.fecha,
              estado: r.estado,
              usuarioCorreo: r.usuarioCorreo
            }
          };
        });

        this._events.set(evs);
        success(evs);
      })
      .catch(err => {
        console.error('Error cargando eventos', err);
        failure(err);
      });
  }

  
  onSelect(sel: any) {
    if (!this.aulaSeleccionada) return;

    const fecha  = (sel.startStr || '').slice(0,10);
    const inicio = (sel.startStr || '').slice(11,19) || '00:00:00';
    const fin    = (sel.endStr   || '').slice(11,19) || '00:00:00';

    if (new Date(fecha) < this.hoyCero()) { alert('No se pueden crear reservas en el pasado.'); return; }


    this.srv.disponible(this.aulaSeleccionada, fecha, inicio, fin).subscribe({
      next: r => {
        if (!r.disponible) { alert(r.mensaje || 'No disponible para ese rango.'); return; }
        this.router.navigate(['/panel/reservas/nueva'], { queryParams: { idAula: this.aulaSeleccionada, fecha, inicio, fin } });
      },
      error: _ => alert('No fue posible verificar disponibilidad.')
    });
  }

  onEventClick(click: any) {
    const ev = click.event;
    const id = Number(ev.id);
    const estado = (ev.extendedProps as any)?.estado || '';
    const f = (d: Date | null) => d ? d.toLocaleString() : '';


    if (!this.canCancel) {
      alert(`Reserva #${id}\nEstado: ${estado}\nInicio: ${f(ev.start)}\nFin: ${f(ev.end)}`);
      return;
    }

    const msg = `Reserva #${id}\n`+
                `Título: ${ev.title}\n`+
                `Inicio: ${f(ev.start)}\n`+
                `Fin: ${f(ev.end)}\n`+
                `Estado: ${estado}\n\n¿Cancelar esta reserva?`;
    if (!confirm(msg)) return;
    if (!confirm('Confirma cancelación definitiva?')) return;

    this.srv.cancelar(id).subscribe({
      next: () => { alert('Reserva cancelada'); this.refetch(); },
      error: e => alert('No fue posible cancelar: ' + (e?.error?.message || ''))
    });
  }

  onEventDrop(arg: any) {
    if (!this.canEdit) { arg.revert(); return; } 

    const ev = arg.event;
    const start = ev.startStr;
    const end   = ev.endStr || start;
    const nuevaFecha = start.slice(0,10);
    const nuevaHi = start.slice(11,19);
    const nuevaHf = end.slice(11,19);

    const props = ev.extendedProps as any;
    const idAula = props?.idAula;
    const fechaOriginal = props?.fecha;

    if (nuevaFecha !== fechaOriginal) { alert('Mover a otro día no está soportado.'); arg.revert(); return; }
    if (new Date(nuevaFecha) < this.hoyCero()) { alert('No puedes mover al pasado.'); arg.revert(); return; }


    this.srv.disponible(idAula, nuevaFecha, nuevaHi, nuevaHf, Number(ev.id)).subscribe({
      next: r => {
        if (!r.disponible) { alert(r.mensaje || 'Solapamiento detectado.'); arg.revert(); return; }
        this.srv.updateHorario(Number(ev.id), this.ensureSeconds(nuevaHi), this.ensureSeconds(nuevaHf)).subscribe({
          next: () => { (ev.extendedProps as any).estado = 'Activa'; this.refetch(); },
          error: e => { alert('No fue posible actualizar: ' + (e?.error?.message || '')); arg.revert(); }
        });
      },
      error: _ => { alert('No fue posible verificar disponibilidad.'); arg.revert(); }
    });
  }

  onEventResize(arg: any) {
    if (!this.canEdit) { arg.revert(); return; } 
    const ev = arg.event;
    const start = ev.startStr;
    const end   = ev.endStr || start;
    const fecha = start.slice(0,10);
    const hi = start.slice(11,19);
    const hf = end.slice(11,19);

    const props = ev.extendedProps as any;
    const idAula = props?.idAula;

    if (new Date(fecha) < this.hoyCero()) { alert('No puedes editar en el pasado.'); arg.revert(); return; }


    this.srv.disponible(idAula, fecha, hi, hf, Number(ev.id)).subscribe({
      next: r => {
        if (!r.disponible) { alert(r.mensaje || 'Solapamiento detectado.'); arg.revert(); return; }
        this.srv.updateHorario(Number(ev.id), this.ensureSeconds(hi), this.ensureSeconds(hf)).subscribe({
          next: () => this.refetch(),
          error: e => { alert('No fue posible actualizar: ' + (e?.error?.message || '')); arg.revert(); }
        });
      },
      error: _ => { alert('No fue posible verificar disponibilidad.'); arg.revert(); }
    });
  }

  private enumerarFechas(desde: string, hasta: string): string[] {
    const out: string[] = [];
    const d = new Date(desde);
    const end = new Date(hasta);
    while (d < end) {
      out.push(d.toISOString().slice(0,10));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  private colorPorEstado(estado: string) {
    switch ((estado || '').toLowerCase()) {
      case 'activa': return '#1976d2';
      case 'cancelada': return '#b0bec5';
      case 'finalizada': return '#757575';
      default: return '#5c6bc0';
    }
  }

  private ensureSeconds(hhmm: string) { return hhmm?.length === 5 ? `${hhmm}:00` : hhmm; }
  private hoyCero(): Date { const d = new Date(); d.setHours(0,0,0,0); return d; }
}
