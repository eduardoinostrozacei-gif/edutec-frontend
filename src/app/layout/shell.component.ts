import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-shell',
  template: `
    <mat-toolbar color="primary" class="bar">
      <span class="brand">
        <mat-icon>school</mat-icon>
        <strong>Edutec</strong>
      </span>

      <span class="spacer"></span>

      <!-- Visible para TODOS los perfiles logueados -->
      <a mat-button routerLink="/panel/reservas/mias">
        <mat-icon>event</mat-icon>
        Mis reservas
      </a>

      <a mat-button routerLink="/panel/reservas/buscar">
        <mat-icon>search</mat-icon>
        Buscar por día
      </a>

      <a mat-button routerLink="/panel/calendario">
        <mat-icon>calendar_month</mat-icon>
        Calendario
      </a>

      <!-- ADMIN -->
      <ng-container *ngIf="isAdmin()">
        <a mat-button routerLink="/panel/aulas">
          <mat-icon>school</mat-icon>
          Aulas
        </a>
      </ng-container>

      <!-- ADMIN o DOCENTE -->
      <ng-container *ngIf="isAdmin() || isDocente()">
        <a mat-button routerLink="/panel/reportes">
          <mat-icon>insights</mat-icon>
          Reportes
        </a>
      </ng-container>

      <button mat-button (click)="salir()">
        <mat-icon>logout</mat-icon>
        Salir
      </button>
    </mat-toolbar>

    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .bar { position: sticky; top: 0; z-index: 10; }
    .brand { display:flex; align-items:center; gap:8px; }
    .spacer { flex: 1 1 auto; }
    .content { padding: 16px; }
    a[mat-button], a[mat-stroked-button] { text-decoration: none; }
    a[mat-stroked-button] { margin: 0 8px; }
  `],
  imports: [
    CommonModule,
    RouterOutlet, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule
  ]
})
export class ShellComponent implements OnInit {
  constructor(private auth: AuthService) {}

  async ngOnInit() {
    await this.auth.ensureRoles();
  }

  isAdmin()   { return this.auth.isAdmin(); }
  isDocente() { return this.auth.isDocente(); }

  salir(){
    this.auth.logout();
    location.href = '/login';
  }
}
