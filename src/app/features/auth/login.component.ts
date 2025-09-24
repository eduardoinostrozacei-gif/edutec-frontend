import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  template: `
  <div class="container">
    <mat-card>
      <h2>Ingresar</h2>
      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Correo</mat-label>
          <input matInput name="correo" [(ngModel)]="correo" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" name="contrasena" [(ngModel)]="contrasena" required>
        </mat-form-field>
        <button mat-raised-button color="primary" class="full" [disabled]="f.invalid || cargando">
          {{ cargando ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>

      <ul class="hint">
        <li>admin&#64;edutec.cl / TEMP_1234</li>
        <li>docente&#64;edutec.cl / 1234</li>
        <li>alumno&#64;edutec.cl / 1234</li>
      </ul>
    </mat-card>
  </div>
  `,
  styles:[`
    .container{min-height:100vh;display:flex;align-items:center;justify-content:center}
    mat-card{width:360px;padding:16px}
    .full{width:100%}
    .hint{margin-top:12px;color:#777;font-size:12px}
  `],
  imports:[CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule]
})
export class LoginComponent {
  correo=''; contrasena='';
  cargando = false;
  constructor(private auth:AuthService, private router:Router){}

  async onSubmit(){
    this.cargando = true;
    try {
      await this.auth.login({ correo:this.correo, contrasena:this.contrasena });
      this.router.navigate(['/panel']);
    } catch (e:any) {
      alert('Login fallido: '+ (e?.error?.message || 'verifique credenciales'));
    } finally {
      this.cargando = false;
    }
  }
}
