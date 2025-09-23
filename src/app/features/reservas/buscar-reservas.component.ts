import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReservasService, Aula, ReservaItem, PageResponse } from '../../services/reservas.service';

@Component({
  standalone: true,
  template: `
    <h2>Consulta por fecha + aula</h2>

    <mat-card>
      <form (ngSubmit)="buscar()">
        <div class="grid">

          <mat-form-field appearance="outline">
            <mat-label>Aula</mat-label>
            <mat-select name="idAula" [(ngModel)]="idAula" required>
              <mat-option *ngFor="let a of aulas" [value]="a.idAula">
                {{ a.nombre }} (cap. {{ a.capacidad }}) {{ a.ubicacion ? '– '+a.ubicacion : '' }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input matInput type="date" name="fecha" [(ngModel)]="fecha" required />
          </mat-form-field>

        </div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="!idAula || !fecha">Buscar</button>
        </div>
      </form>
    </mat-card>

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

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols;"></tr>
    </table>

    <p *ngIf="!cargando && consultado && !items.length">No hay reservas para ese día/aula.</p>
  `,
  styles: [`
    mat-card { padding: 16px; max-width: 860px; }
    .grid { display:grid; grid-template-columns: repeat(2,minmax(250px,1fr)); gap:12px; }
    .actions { margin-top: 12px; }
    table { width:100%; margin-top: 16px; }
  `],
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule,
    MatTableModule, MatProgressBarModule
  ]
})
export class BuscarReservasComponent {
  aulas: Aula[] = [];
  idAula!: number;
  fecha = ''; 

  cargando = false;
  consultado = false;
  cols = ['id','aula','fecha','horario','estado'];
  items: ReservaItem[] = [];

  constructor(private srv: ReservasService) {

    this.srv.listarAulas(0, 100).subscribe({
      next: p => this.aulas = p.content,
      error: () => {}
    });
  }

  buscar() {
    if (!this.idAula || !this.fecha) return;
    this.cargando = true;
    this.consultado = true;

    this.srv.listarPorFechaAula(this.fecha, this.idAula, 0, 50).subscribe({
      next: (p: PageResponse<ReservaItem>) => { this.items = p.content; this.cargando = false; },
      error: () => { this.items = []; this.cargando = false; }
    });
  }
}
