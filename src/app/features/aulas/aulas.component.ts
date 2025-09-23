import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AulasService, Aula } from '../../services/aulas.service';

@Component({
  standalone: true,
  template: `
    <h2>Administrar aulas</h2>

    <mat-card>
      <form (ngSubmit)="guardar()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre</mat-label>
          <input matInput [(ngModel)]="form.nombre" name="nombre" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Capacidad</mat-label>
          <input matInput type="number" [(ngModel)]="form.capacidad" name="capacidad" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Ubicación</mat-label>
          <input matInput [(ngModel)]="form.ubicacion" name="ubicacion" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>ID Tipo Aula</mat-label>
          <input matInput type="number" [(ngModel)]="form.idTipoAula" name="idTipoAula" required />
        </mat-form-field>

        <button mat-raised-button color="primary">
          {{ form.idAula ? 'Actualizar' : 'Crear' }}
        </button>
        <button mat-button type="button" (click)="cancelar()">Cancelar</button>
      </form>
    </mat-card>

    <table mat-table [dataSource]="aulas" class="mat-elevation-z2" *ngIf="aulas.length">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>#</th>
        <td mat-cell *matCellDef="let a">{{ a.idAula }}</td>
      </ng-container>
      <ng-container matColumnDef="nombre">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let a">{{ a.nombre }}</td>
      </ng-container>
      <ng-container matColumnDef="capacidad">
        <th mat-header-cell *matHeaderCellDef>Capacidad</th>
        <td mat-cell *matCellDef="let a">{{ a.capacidad }}</td>
      </ng-container>
      <ng-container matColumnDef="ubicacion">
        <th mat-header-cell *matHeaderCellDef>Ubicación</th>
        <td mat-cell *matCellDef="let a">{{ a.ubicacion }}</td>
      </ng-container>
      <ng-container matColumnDef="acciones">
        <th mat-header-cell *matHeaderCellDef>Acciones</th>
        <td mat-cell *matCellDef="let a">
          <button mat-icon-button color="primary" (click)="editar(a)"><mat-icon>edit</mat-icon></button>
          <button mat-icon-button color="warn" (click)="borrar(a.idAula)"><mat-icon>delete</mat-icon></button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols;"></tr>
    </table>

    <p *ngIf="!aulas.length">No hay aulas registradas.</p>
  `,
  styles: [`
    form { display: grid; gap: 12px; margin-bottom: 16px; }
    .full { width: 100%; }
    table { margin-top: 16px; width: 100%; }
  `],
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatCardModule, MatFormFieldModule, MatInputModule
  ]
})
export class AulasComponent implements OnInit {
  aulas: Aula[] = [];
  cols = ['id','nombre','capacidad','ubicacion','acciones'];
  form: Aula = { nombre:'', capacidad:0, ubicacion:'', idTipoAula:1 };

  constructor(private srv: AulasService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.srv.listar(0, 100).subscribe(r => this.aulas = r.content);
  }

  guardar() {
    if (this.form.idAula) {
      this.srv.actualizar(this.form.idAula, this.form).subscribe(() => { this.cargar(); this.cancelar(); });
    } else {
      this.srv.crear(this.form).subscribe(() => { this.cargar(); this.cancelar(); });
    }
  }

  editar(aula: Aula) { this.form = { ...aula, idTipoAula: (aula as any).idTipoAula ?? 1 }; }

  borrar(id?: number) {
    if (!id) return;
    if (confirm(`¿Eliminar aula #${id}?`)) this.srv.eliminar(id).subscribe(() => this.cargar());
  }

  cancelar() { this.form = { nombre:'', capacidad:0, ubicacion:'', idTipoAula:1 }; }
}
