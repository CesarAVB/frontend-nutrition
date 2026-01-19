// src/app/services/paciente.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PacienteDTO } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/pacientes`;

  /**
   * Lista todos os pacientes
   */
  listarTodos(): Observable<PacienteDTO[]> {
    return this.http.get<PacienteDTO[]>(this.apiUrl).pipe(
      map((arr: any[]) =>
        arr.map((p: any) => ({
          ...p,
          ultimaConsulta:
            p.ultimaConsulta || p.ultima_consulta || p.data_consulta || p.dataConsulta || p.createdAt || p.created_at || null,
        }))
      )
    );
  }

  /**
   * Busca paciente por ID
   */
  buscarPorId(id: number): Observable<PacienteDTO> {
    return this.http.get<PacienteDTO>(`${this.apiUrl}/${id}`).pipe(
      map((p: any) => ({
        ...p,
        ultimaConsulta:
          p.ultimaConsulta || p.ultima_consulta || p.data_consulta || p.dataConsulta || p.createdAt || p.created_at || null,
      }))
    );
  }

  /**
   * Busca paciente por CPF
   */
  buscarPorCpf(cpf: string): Observable<PacienteDTO> {
    return this.http.get<PacienteDTO>(`${this.apiUrl}/cpf/${cpf}`);
  }

  /**
   * Busca pacientes por nome
   */
  buscarPorNome(nome: string): Observable<PacienteDTO[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<PacienteDTO[]>(`${this.apiUrl}/buscar`, { params });
  }

  /**
   * Cadastra novo paciente
   */
  cadastrar(paciente: PacienteDTO): Observable<PacienteDTO> {
    return this.http.post<PacienteDTO>(this.apiUrl, paciente);
  }

  /**
   * Atualiza dados do paciente
   */
  atualizar(id: number, paciente: PacienteDTO): Observable<PacienteDTO> {
    return this.http.put<PacienteDTO>(`${this.apiUrl}/${id}`, paciente);
  }

  /**
   * Deleta paciente
   */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}