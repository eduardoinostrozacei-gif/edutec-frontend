import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';

import { LoginComponent } from './features/auth/login.component';
import { ShellComponent } from './layout/shell.component';
import { MisReservasComponent } from './features/reservas/mis-reservas.component';
import { BuscarReservasComponent } from './features/reservas/buscar-reservas.component';
import { NuevaReservaComponent } from './features/reservas/nueva-reserva.component';
import { CalendarioComponent } from './features/reservas/calendario.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { AulasComponent } from './features/aulas/aulas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'panel',
    canActivate: [AuthGuard],
    component: ShellComponent,
    children: [
      { path: 'reservas/mias', component: MisReservasComponent },
      { path: 'reservas/buscar', component: BuscarReservasComponent },
      { path: 'reservas/nueva', component: NuevaReservaComponent },
      { path: 'calendario', component: CalendarioComponent },

      // Reportes: ADMIN o DOCENTE
      { path: 'reportes', component: ReportesComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN','DOCENTE'] } },

      // Administración: solo ADMIN
      { path: 'aulas', component: AulasComponent, canActivate: [RoleGuard], data: { roles: ['ADMIN'] } },

      { path: '', pathMatch: 'full', redirectTo: 'reservas/mias' },
    ],
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
