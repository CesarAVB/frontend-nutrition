import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PacienteDTO } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/pacientes`;

  // =======================================
  // # listarTodos - Lista todos os pacientes
  // =======================================
  listarTodos(): Observable<PacienteDTO[]> {
    return this.http.get<PacienteDTO[]>(this.apiUrl).pipe(
      map((arr: any[]) =>
        arr.map((p: any) => {
          const raw = p.ultimaConsulta || p.ultima_consulta || p.data_consulta || p.dataConsulta || p.createdAt || p.created_at || null;
          return {
            ...p,
            ultimaConsulta: this.normalizeDateValue(raw),
          } as any;
        })
      )
    );
  }

  // =======================================
  // # buscarPorId - Busca paciente por ID
  // =======================================
  buscarPorId(id: number): Observable<PacienteDTO> {
    return this.http.get<PacienteDTO>(`${this.apiUrl}/${id}`).pipe(
      map((p: any) => {
        const raw = p.ultimaConsulta || p.ultima_consulta || p.data_consulta || p.dataConsulta || p.createdAt || p.created_at || null;
        const rawDataNascimento = p.dataNascimento || p.data_nascimento || null;
        return {
          ...p,
          ultimaConsulta: this.normalizeDateValue(raw),
          dataNascimento: this.normalizeDateValue(rawDataNascimento),
        } as any;
      })
    );
  }

  // ===========================================
  // # normalizeDateValue - Normaliza valor de data
  // ===========================================
  private normalizeDateValue(value: any): string | null {
    if (!value && value !== 0) return null;
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') {
      const asMs = value > 1e12 ? value : value * 1000;
      const d = new Date(asMs);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
    if (Array.isArray(value) && value.length >= 3) {
      const [y, m, d, h = 0, min = 0, s = 0] = value.map((v: any) => Number(v));
      const dateObj = new Date(y, (m || 1) - 1, d, h, min, s);
      return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
    }
    return null;
  }

  // =======================================
  // # buscarPorCpf - Busca paciente por CPF
  // =======================================
  buscarPorCpf(cpf: string): Observable<PacienteDTO> {
    return this.http.get<PacienteDTO>(`${this.apiUrl}/cpf/${cpf}`);
  }

  // =======================================
  // # buscarPorNome - Busca pacientes por nome
  // =======================================
  buscarPorNome(nome: string): Observable<PacienteDTO[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<PacienteDTO[]>(`${this.apiUrl}/buscar`, { params });
  }

  // =======================================
  // # cadastrar - Cadastra novo paciente
  // =======================================
  cadastrar(paciente: PacienteDTO): Observable<PacienteDTO> {
    return this.http.post<PacienteDTO>(this.apiUrl, paciente);
  }

  // =======================================
  // # atualizar - Atualiza dados do paciente
  // =======================================
  atualizar(id: number, paciente: PacienteDTO): Observable<PacienteDTO> {
    return this.http.put<PacienteDTO>(`${this.apiUrl}/${id}`, paciente);
  }

  // =======================================
  // # deletar - Deleta paciente
  // =======================================
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}