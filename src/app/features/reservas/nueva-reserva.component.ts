import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';

import { ReservasService, Aula, DisponibilidadResp } from '../../services/reservas.service';

@Component({
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule
  ],
  template: `
    <h2>Nueva reserva</h2>

    <mat-card style="padding:16px;max-width:840px">
      <div class="grid">
        <mat-form-field appearance="outline">
          <mat-label>Aula*</mat-label>
          <mat-select [(ngModel)]="idAula">
            <mat-option *ngFor="let a of aulas" [value]="a.idAula">
              {{a.nombre}} (cap. {{a.capacidad}})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha*</mat-label>
          <input matInput type="date" [(ngModel)]="fecha">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Hora inicio*</mat-label>
          <input matInput type="time" [(ngModel)]="horaInicio" step="1800">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Hora fin*</mat-label>
          <input matInput type="time" [(ngModel)]="horaFin" step="1800">
        </mat-form-field>
      </div>

      <div class="actions">
        <button mat-stroked-button color="primary" (click)="verDisp()" [disabled]="!valido()">
          Ver disponibilidad
        </button>
        <button mat-raised-button color="primary" (click)="crear()" [disabled]="!valido()">
          Crear
        </button>
      </div>

      <p *ngIf="mensaje" [style.color]="dispOK ? 'green' : 'crimson'">{{mensaje}}</p>
    </mat-card>
  `,
  styles:[`
    .grid{ display:grid; grid-template-columns: repeat(2,minmax(220px,1fr)); gap:12px; }
    .actions{ margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
  `]
})
export class NuevaReservaComponent implements OnInit {
  aulas: Aula[] = [];

  idAula: number | null = null;
  fecha = '';
  horaInicio = '';  
  horaFin = '';     

  mensaje = '';
  dispOK = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private srv: ReservasService
  ) {}

  ngOnInit(): void {
    this.srv.listarAulas(0, 100).subscribe({
      next: p => {
        this.aulas = p.content || [];
        if (!this.idAula && this.aulas.length) {
          this.idAula = this.aulas[0].idAula!;
        }
      }
    });

    this.route.queryParamMap.subscribe(q => {
      const a = q.get('idAula');
      const f = q.get('fecha');
      const i = q.get('inicio'); 
      const h = q.get('fin');    

      if (a) this.idAula = Number(a);
      if (f) this.fecha = f;
      if (i) this.horaInicio = i.slice(0,5); 
      if (h) this.horaFin = h.slice(0,5);
      
      this.mensaje = '';
      this.dispOK = false;
    });
  }

  valido(){
    return !!(this.idAula && this.fecha && this.horaInicio && this.horaFin);
  }

  private withSeconds(hhmm: string): string {
    return hhmm.length === 5 ? `${hhmm}:00` : hhmm;
  }

  verDisp(){
    this.mensaje = '';
    if (!this.valido()) return;

    const hi = this.withSeconds(this.horaInicio);
    const hf = this.withSeconds(this.horaFin);

    this.srv.disponible(this.idAula!, this.fecha, hi, hf).subscribe({
      next: (r: DisponibilidadResp) => {
        this.dispOK = r.disponible;
        this.mensaje = r.mensaje;
      },
      error: e => {
        this.dispOK = false;
        this.mensaje = e?.error?.message || 'Error al consultar';
      }
    });
  }

  crear(){
    if (!this.valido()) return;

    const hi = this.withSeconds(this.horaInicio);
    const hf = this.withSeconds(this.horaFin);

    this.srv.crear({ idAula: this.idAula!, fecha: this.fecha, horaInicio: hi, horaFin: hf }).subscribe({
      next: () => {
        alert('Reserva creada');
        this.router.navigate(['/panel/reservas/mias']);
      },
      error: e => alert('No se pudo crear: ' + (e?.error?.message || ''))
    });
  }
}
