import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { ReservasService, ReservaItem, PageResponse } from '../../services/reservas.service';

@Component({
  standalone: true,
  template: `
    <h2>Mis reservas</h2>

    <div class="actions">
      <a mat-stroked-button color="primary" routerLink="/panel/reservas/nueva">+ Nueva reserva</a>
    </div>

    <mat-progress-bar *ngIf="cargando" mode="indeterminate"></mat-progress-bar>

    <table mat-table [dataSource]="items" class="mat-elevation-z2" *ngIf="!cargando && items.length">

      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>#</th>
        <td mat-cell *matCellDef="let r">{{ r.idReserva }}</td>
      </ng-container>

      <ng-container matColumnDef="aula">
        <th mat-header-cell *matHeaderCellDef>Aula</th>
        <td mat-cell *matCellDef="let r">{{ r.aulaNombre }}</td>
      </ng-container>

      <ng-container matColumnDef="fecha">
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let r">{{ r.fecha }}</td>
      </ng-container>

      <ng-container matColumnDef="horario">
        <th mat-header-cell *matHeaderCellDef>Horario</th>
        <td mat-cell *matCellDef="let r">{{ r.horaInicio }} - {{ r.horaFin }}</td>
      </ng-container>

      <ng-container matColumnDef="estado">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let r">{{ r.estado }}</td>
      </ng-container>

      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let r">
          <button mat-button color="warn" (click)="cancelar(r.idReserva)">Cancelar</button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols;"></tr>
    </table>

    <p *ngIf="!cargando && !items.length">No tienes reservas.</p>
  `,
  styles: [`
    .actions { margin: 8px 0 12px; }
    table { width: 100%; margin-top: 12px; }
    th.mat-header-cell { font-weight: 600; }
  `],
  imports: [CommonModule, MatTableModule, MatButtonModule, MatProgressBarModule, RouterLink]
})
export class MisReservasComponent implements OnInit {
  cols = ['id','aula','fecha','horario','estado','acciones'];
  items: ReservaItem[] = [];
  cargando = false;
  constructor(private srv: ReservasService) {}
  ngOnInit(){ this.cargar(); }

  cargar(){
    this.cargando = true;
    this.srv.listarMias(0,20).subscribe({
      next: (p: PageResponse<ReservaItem>) => { this.items = p.content; this.cargando = false; },
      error: (_: any) => this.srv.listarMiasPage(0,20).subscribe({
        next: (p2: PageResponse<ReservaItem>) => { this.items = p2.content; this.cargando = false; },
        error: (e2: any) => { this.cargando = false; alert('No fue posible cargar tus reservas: ' + (e2?.error?.message || '')); }
      })
    });
  }

  cancelar(id: number){
    if(!confirm(`Cancelar reserva #${id}?`)) return;
    this.srv.cancelar(id).subscribe({
      next: ()=> this.cargar(),
      error: (e: any)=> alert('Error al cancelar: ' + (e?.error?.message || ''))
    });
  }
}
