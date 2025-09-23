import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RecursosService, Recurso, TipoRecurso } from '../../services/recursos.service';
import { ReservasService, Aula } from '../../services/reservas.service';

@Component({
  standalone: true,
  template: `
    <h2>Administrar recursos</h2>

    <mat-card>
      <form (ngSubmit)="guardar()">
        <div class="grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre del recurso</mat-label>
            <input matInput [(ngModel)]="form.nombre" name="nombre" required />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de recurso</mat-label>
            <mat-select [(ngModel)]="form.idTipoRecurso" name="idTipoRecurso" required>
              <mat-option *ngFor="let t of tipos" [value]="t.idTipoRecurso">{{ t.nombre }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Aula</mat-label>
            <mat-select [(ngModel)]="form.idAula" name="idAula" required>
              <mat-option *ngFor="let a of aulas" [value]="a.idAula">
                {{ a.nombre }} (cap. {{ a.capacidad }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="actions">
          <button mat-raised-button color="primary">{{ form.idRecurso ? 'Actualizar' : 'Crear' }}</button>
          <button mat-button type="button" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    </mat-card>

    <table mat-table [dataSource]="items" class="mat-elevation-z2" *ngIf="items.length">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>#</th>
        <td mat-cell *matCellDef="let r">{{ r.idRecurso }}</td>
      </ng-container>
      <ng-container matColumnDef="nombre">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let r">{{ r.nombre }}</td>
      </ng-container>
      <ng-container matColumnDef="tipo">
        <th mat-header-cell *matHeaderCellDef>Tipo</th>
        <td mat-cell *matCellDef="let r">{{ tipoNombre(r.idTipoRecurso) }}</td>
      </ng-container>
      <ng-container matColumnDef="aula">
        <th mat-header-cell *matHeaderCellDef>Aula</th>
        <td mat-cell *matCellDef="let r">{{ aulaNombre(r.idAula) }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let r">
          <button mat-icon-button color="primary" (click)="editar(r)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button color="warn" (click)="borrar(r.idRecurso)"><mat-icon>delete</mat-icon></button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols;"></tr>
    </table>

    <p *ngIf="!items.length">No hay recursos registrados.</p>
  `,
  styles: [`
    mat-card { padding:16px; margin-bottom: 12px; }
    .grid { display:grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: 12px; }
    .actions { margin-top: 8px; display:flex; gap: 8px; }
    table { width:100%; margin-top: 8px; }
  `],
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ]
})
export class RecursosComponent implements OnInit {
  items: Recurso[] = [];
  tipos: TipoRecurso[] = [];
  aulas: Aula[] = [];
  cols = ['id','nombre','tipo','aula','acciones'];

  form: Recurso = { nombre: '', idTipoRecurso: 0, idAula: 0 };

  constructor(
    private recursos: RecursosService,
    private cat: ReservasService
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.recursos.listarTipos().subscribe(ts => this.tipos = ts);
    this.cat.listarAulas(0, 100).subscribe(p => this.aulas = p.content);
  }

  cargar() { this.recursos.listar().subscribe(r => this.items = r); }

  guardar() {
    if (this.form.idRecurso) {
      this.recursos.actualizar(this.form.idRecurso, this.form).subscribe(() => { this.cargar(); this.cancelar(); });
    } else {
      this.recursos.crear(this.form).subscribe(() => { this.cargar(); this.cancelar(); });
    }
  }

  editar(r: Recurso) { this.form = { ...r }; }

  borrar(id?: number) {
    if (!id) return;
    if (confirm(`¿Eliminar recurso #${id}?`)) this.recursos.eliminar(id).subscribe(() => this.cargar());
  }

  cancelar() { this.form = { nombre: '', idTipoRecurso: 0, idAula: 0 }; }

  tipoNombre(id: number) { return this.tipos.find(t => t.idTipoRecurso === id)?.nombre || id; }
  aulaNombre(id: number) { return this.aulas.find(a => a.idAula === id)?.nombre || id; }
}
