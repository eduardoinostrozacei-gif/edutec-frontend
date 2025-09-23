import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface MeResponse {
  usuario: string;
  authorities: string[]; 
}

@Injectable({ providedIn: 'root' })
export class MeService {
  private readonly base = environment.api;
  constructor(private http: HttpClient) {}

  me() {
    return this.http.get<MeResponse>(`${this.base}/me`);
  }
}
