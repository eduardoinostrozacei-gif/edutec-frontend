import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AdminCatalogoService } from '../../services/admin-catalogo.service';

@Component({
  standalone: true,
  selector: 'app-tipos-recurso',
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule],
  template: `
  <h2>Tipos de Recurso (Admin)</h2>
  <mat-card style="display:grid; gap:12px; padding:12px">
    <div style="display:flex; gap:8px; align-items:end; flex-wrap:wrap">
      <mat-form-field appearance="outline">
        <mat-label>Nombre</mat-label>
        <input matInput [(ngModel)]="nombre" placeholder="Ej: Proyector">
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="agregar()">Agregar</button>
    </div>

    <table class="simple">
      <thead><tr><th>Nombre</th><th style="width:160px">Acciones</th></tr></thead>
      <tbody>
        <tr *ngFor="let t of tipos">
          <td>
            <input [(ngModel)]="t.nombre" style="width:100%">
          </td>
          <td>
            <button mat-button color="primary" (click)="guardar(t)">Guardar</button>
            <button mat-button color="warn" (click)="eliminar(t)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </mat-card>
  `,
  styles:[`.simple{width:100%;border-collapse:collapse} .simple th,.simple td{border:1px solid #ddd;padding:8px}`]
})
export class TiposRecursoComponent implements OnInit {
  tipos:any[] = [];
  nombre = '';

  constructor(private admin: AdminCatalogoService) {}

  ngOnInit(): void { this.load(); }

  load() { this.admin.listarTiposRecurso().subscribe(t => this.tipos = t || []); }

  agregar() {
    const n = (this.nombre || '').trim();
    if (!n) return;
    this.admin.crearTipoRecurso(n).subscribe({
      next: _ => { this.nombre=''; this.load(); },
      error: e => alert(e?.error?.message || 'No se pudo crear')
    });
  }

  guardar(t:any) {
    const n = (t.nombre || '').trim();
    if (!n) return;
    this.admin.actualizarTipoRecurso(t.idTipoRecurso, n).subscribe({
      next: _ => this.load(),
      error: e => alert(e?.error?.message || 'No se pudo actualizar')
    });
  }

  eliminar(t:any) {
    if (!confirm('¿Eliminar tipo de recurso?')) return;
    this.admin.eliminarTipoRecurso(t.idTipoRecurso).subscribe({
      next: _ => this.load(),
      error: e => alert(e?.error?.message || 'No se pudo eliminar')
    });
  }
}
