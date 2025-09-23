import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AdminCatalogoService, Recurso, TipoRecurso } from '../../services/admin-catalogo.service';
import { ReservasService, Aula } from '../../services/reservas.service';

@Component({
  standalone: true,
  selector: 'app-recursos-aula',
  imports: [CommonModule, FormsModule, MatCardModule, MatSelectModule, MatInputModule, MatButtonModule],
  template: `
  <h2>Recursos por Aula (Admin)</h2>
  <mat-card style="display:grid; gap:12px; padding:12px">
    <div style="display:flex; gap:12px; align-items:end; flex-wrap:wrap">
      <div>
        <label>Aula</label><br>
        <select [(ngModel)]="idAula" (change)="load()">
          <option *ngFor="let a of aulas" [value]="a.idAula">{{a.nombre}} (cap {{a.capacidad}})</option>
        </select>
      </div>

      <div>
        <label>Tipo de recurso</label><br>
        <select [(ngModel)]="idTipoRecurso">
          <option *ngFor="let t of tipos" [value]="t.idTipoRecurso">{{t.nombre}}</option>
        </select>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>Nombre del recurso</mat-label>
        <input matInput [(ngModel)]="nombreRecurso" placeholder="Ej: Proyector Epson">
      </mat-form-field>

      <button mat-raised-button color="primary" (click)="agregar()">Agregar</button>
    </div>

    <div>
      <h3>Listado</h3>
      <table class="simple">
        <thead><tr><th>Nombre</th><th>Tipo</th><th style="width:120px">Acciones</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of recursos">
            <td>{{r.nombre}}</td>
            <td>{{r.tipoRecurso.nombre}}</td> 
            <td>
              <button mat-button color="warn" (click)="eliminar(r.idRecurso)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </mat-card>
  `,
  styles:[`.simple{width:100%;border-collapse:collapse} .simple th,.simple td{border:1px solid #ddd;padding:8px}`]
})
export class RecursosAulaComponent implements OnInit {
  aulas: Aula[] = [];
  tipos: TipoRecurso[] = [];
  recursos: Recurso[] = [];
  idAula: number | null = null;
  idTipoRecurso: number | null = null;
  nombreRecurso = '';

  constructor(private admin: AdminCatalogoService, private reservas: ReservasService) {}

  ngOnInit(): void {
    this.reservas.listarAulas(0,100).subscribe({
      next: (p) => {
        this.aulas = p.content || [];
        if (this.aulas.length) this.idAula = this.aulas[0].idAula;
        this.admin.listarTiposRecurso().subscribe({
          next: (t) => {
            this.tipos = t || [];
            if (this.tipos.length) this.idTipoRecurso = this.tipos[0].idTipoRecurso;
            this.load();
          },
          error: (e: any) => alert(e?.error?.message || 'No se pudieron cargar tipos de recurso')
        });
      },
      error: (e: any) => alert(e?.error?.message || 'No se pudieron cargar aulas')
    });
  }

  load(): void {
    if (!this.idAula) { this.recursos = []; return; }
    this.admin.listarRecursosPorAula(this.idAula).subscribe({
      next: (rs) => this.recursos = rs || [],
      error: (e: any) => alert(e?.error?.message || 'No se pudieron cargar recursos')
    });
  }

  agregar(): void {
    const nombre = (this.nombreRecurso || '').trim();
    if (!this.idAula || !this.idTipoRecurso || !nombre) return;

    this.admin.crearRecurso({ nombre, idTipoRecurso: this.idTipoRecurso, idAula: this.idAula })
      .subscribe({
        next: () => { this.nombreRecurso=''; this.load(); },
        error: (e: any) => alert(e?.error?.message || 'No se pudo crear el recurso')
      });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar recurso?')) return;
    this.admin.eliminarRecurso(id).subscribe({
      next: () => this.load(),
      error: (e: any) => alert(e?.error?.message || 'No se pudo eliminar el recurso')
    });
  }
}
