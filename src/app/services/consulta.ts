import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ConsultaResumoDTO,
  ConsultaDetalhadaDTO,
  ComparativoConsultasDTO,
} from '../models/consulta.model';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/consultas`;

  criar(pacienteId: number): Observable<ConsultaResumoDTO> {
    return this.http.post<ConsultaResumoDTO>(`${this.apiUrl}/paciente/${pacienteId}`, {});
  }

  listarPorPaciente(pacienteId: number): Observable<ConsultaResumoDTO[]> {
    return this.http.get<ConsultaResumoDTO[]>(`${this.apiUrl}/paciente/${pacienteId}`);
  }

  buscarCompleta(id: number): Observable<ConsultaDetalhadaDTO> {
    return this.http.get<ConsultaDetalhadaDTO>(`${this.apiUrl}/${id}`);
  }

  comparar(
    pacienteId: number,
    consultaInicialId: number,
    consultaFinalId: number
  ): Observable<ComparativoConsultasDTO> {
    const params = new HttpParams()
      .set('consultaInicialId', consultaInicialId.toString())
      .set('consultaFinalId', consultaFinalId.toString());

    return this.http.get<ComparativoConsultasDTO>(`${this.apiUrl}/comparar/${pacienteId}`, {
      params,
    });
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarTodas(): Observable<ConsultaResumoDTO[]> {
    return this.http.get<ConsultaResumoDTO[]>(`${this.apiUrl}`);
  }

  atualizarData(id: number, novaData: string): Observable<ConsultaResumoDTO> {
    return this.http.put<ConsultaResumoDTO>(`${this.apiUrl}/${id}/data?novaData=${novaData}`, {});
  }
}
