// src/app/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalPacientes: number;
  consultasHoje: number;
  consultasMes: number;
  proximaConsulta: string;
}

export interface ConsultaHoje {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  iniciais: string;
  horario: string;
  objetivo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/dashboard`;

  buscarEstatisticas(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  buscarConsultasHoje(): Observable<ConsultaHoje[]> {
    return this.http.get<ConsultaHoje[]>(`${this.apiUrl}/consultas-hoje`);
  }

  buscarPacientesRecentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pacientes-recentes`);
  }
}