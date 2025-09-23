import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  ReservasService,
  ReporteUsoAula,
  ReporteEstadoMes,
} from '../../services/reservas.service';

// Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  standalone: true,
  template: `
    <h2>Reportes</h2>

    <mat-card>
      <div class="grid">
        <mat-form-field appearance="outline">
          <mat-label>Desde</mat-label>
          <input matInput type="date" [(ngModel)]="desde" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Hasta</mat-label>
          <input matInput type="date" [(ngModel)]="hasta" />
        </mat-form-field>
      </div>

      <div class="actions">
        <button mat-raised-button color="primary"
                (click)="cargar()" [disabled]="!desde || !hasta">
          Generar
        </button>

        <button mat-stroked-button color="primary"
                (click)="exportarExcel()"
                [disabled]="!uso.length && !estados.length">
          Exportar Excel (XLSX)
        </button>

        <button mat-stroked-button color="primary"
                (click)="exportarPDF()"
                [disabled]="!uso.length && !estados.length">
          Exportar PDF
        </button>
        
      </div>
    </mat-card>

    <mat-progress-bar *ngIf="cargando" mode="indeterminate"></mat-progress-bar>

    <div class="wrap" *ngIf="!cargando">
      <mat-card class="block">
        <h3>Uso de aulas (min)</h3>
        <table mat-table [dataSource]="uso" class="mat-elevation-z2" *ngIf="uso.length">
          <ng-container matColumnDef="aulaId">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let r">{{ r.aulaId }}</td>
          </ng-container>
          <ng-container matColumnDef="aulaNombre">
            <th mat-header-cell *matHeaderCellDef>Aula</th>
            <td mat-cell *matCellDef="let r">{{ r.aulaNombre }}</td>
          </ng-container>
          <ng-container matColumnDef="minutosReservados">
            <th mat-header-cell *matHeaderCellDef>Minutos</th>
            <td mat-cell *matCellDef="let r">{{ r.minutosReservados }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colsUso"></tr>
          <tr mat-row *matRowDef="let row; columns: colsUso;"></tr>
        </table>
        <p *ngIf="!uso.length">Sin datos en el rango.</p>
      </mat-card>

      <mat-card class="block">
        <h3>Estados en el período</h3>
        <table mat-table [dataSource]="estados" class="mat-elevation-z2" *ngIf="estados.length">
          <ng-container matColumnDef="estado">
            <th mat-header-cell *matHeaderCellDef>Estado</th>
            <td mat-cell *matCellDef="let r">{{ r.estado }}</td>
          </ng-container>
          <ng-container matColumnDef="cantidad">
            <th mat-header-cell *matHeaderCellDef>Cantidad</th>
            <td mat-cell *matCellDef="let r">{{ r.cantidad }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="colsEst"></tr>
          <tr mat-row *matRowDef="let row; columns: colsEst;"></tr>
        </table>
        <p *ngIf="!estados.length">Sin datos en el rango.</p>
      </mat-card>
    </div>
  `,
  styles: [`
    mat-card { padding: 16px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 12px; }
    .actions { margin-top: 8px; display:flex; gap:8px; flex-wrap: wrap; }
    .wrap { display: grid; grid-template-columns: repeat(2, minmax(280px, 1fr)); gap: 12px; margin-top: 14px; }
    .block table { width: 100%; margin-top: 10px; }
  `],
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatTableModule, MatProgressBarModule
  ]
})
export class ReportesComponent {
  desde = '';
  hasta = '';
  cargando = false;

  colsUso = ['aulaId','aulaNombre','minutosReservados'];
  colsEst = ['estado','cantidad'];

  uso: ReporteUsoAula[] = [];
  estados: ReporteEstadoMes[] = [];

  constructor(private srv: ReservasService) {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth() + 1;
    const pad = (n: number) => n.toString().padStart(2,'0');
    this.desde = `${y}-${pad(m)}-01`;
    this.hasta = `${y}-${pad(m)}-28`;
  }

  cargar() {
    if (!this.desde || !this.hasta) return;
    this.cargando = true;
    this.uso = []; this.estados = [];

    this.srv.usoAulas(this.desde, this.hasta).subscribe({
      next: data => this.uso = data,
      error: () => {}
    });

    this.srv.estadosMes(this.desde, this.hasta).subscribe({
      next: data => { this.estados = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  // ====== Excel (.xlsx) ======
  exportarExcel(){
    const wb = XLSX.utils.book_new();
    const usoRows = this.uso.map(u => ({ 'Aula ID': u.aulaId, 'Aula': u.aulaNombre, 'Minutos': u.minutosReservados }));
    const wsUso = XLSX.utils.json_to_sheet(usoRows.length ? usoRows : [{ 'Aula ID':'', 'Aula':'', 'Minutos':'' }]);
    XLSX.utils.book_append_sheet(wb, wsUso, 'Uso de aulas');

    const estRows = this.estados.map(e => ({ 'Estado': e.estado, 'Cantidad': e.cantidad }));
    const wsEst = XLSX.utils.json_to_sheet(estRows.length ? estRows : [{ 'Estado':'', 'Cantidad':'' }]);
    XLSX.utils.book_append_sheet(wb, wsEst, 'Estados');

    const nombre = `reportes_${this.desde}_a_${this.hasta}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, nombre);
  }

  // ====== PDF ======
  exportarPDF(){
    const doc = new jsPDF({ unit: 'pt', format: 'a4' }); // 595x842pt
    const margenX = 40;
    let y = 40;

    // Título
    doc.setFontSize(16);
    doc.text('Reportes de reservas', margenX, y);
    y += 18;

    // Rango de fechas
    doc.setFontSize(11);
    doc.text(`Período: ${this.desde} a ${this.hasta}`, margenX, y);
    y += 16;

    // Tabla 1: Uso de aulas
    autoTable(doc, {
      startY: y,
      head: [['Aula ID', 'Aula', 'Minutos']],
      body: this.uso.length
        ? this.uso.map(u => [u.aulaId, u.aulaNombre, u.minutosReservados])
        : [['-', '-', '-']],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [33, 150, 243] } 
    });

    const afterUso = (doc as any).lastAutoTable.finalY || y + 24;

 
    const gap = 16;
    autoTable(doc, {
      startY: afterUso + gap,
      head: [['Estado', 'Cantidad']],
      body: this.estados.length
        ? this.estados.map(e => [e.estado, e.cantidad])
        : [['-', '-']],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [33, 150, 243] }
    });

    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleString()}`, margenX, pageH - 20);

    doc.save(`reportes_${this.desde}_a_${this.hasta}.pdf`);
  }
 }
