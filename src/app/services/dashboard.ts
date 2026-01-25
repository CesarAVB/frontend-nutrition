import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStatsDTO {
  totalPacientes: number;
  consultasHoje: number;
  consultasMes: number;
  proximaConsulta: string;
}

export interface ConsultaHojeDTO {
  id: number;
  pacienteId: number;
  nomePaciente: string;
  iniciais: string;
  horario: Date;
  objetivo?: string;
}

export interface PacienteDTO {
ultimaConsulta: string|null|undefined;
  id: number;
  nomeCompleto: string;
  email: string;
  telefoneWhatsapp: string;
  dataNascimento: string;
  cpf: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/dashboard`;

  // =======================================
  // # obterEstatisticas - Obter estatísticas do dashboard
  // =======================================
  obterEstatisticas(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.apiUrl}/stats`);
  }

  // =======================================
  // # consultasHoje - Obter consultas de hoje
  // =======================================
  consultasHoje(): Observable<ConsultaHojeDTO[]> {
    return this.http.get<ConsultaHojeDTO[]>(`${this.apiUrl}/consultas-hoje`);
  }

  // =======================================
  // # pacientesRecentes - Obter pacientes recentes
  // =======================================
  pacientesRecentes(limite: number = 5): Observable<PacienteDTO[]> {
    return this.http.get<PacienteDTO[]>(`${this.apiUrl}/pacientes-recentes`, {
      params: { limite: limite.toString() }
    });
  }
}