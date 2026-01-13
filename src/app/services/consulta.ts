import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ConsultaResumoDTO,
  ConsultaDetalhadaDTO,
  ComparativoConsultasDTO,
} from '../models/consulta.model';
import { CriarConsultaDTO } from '../models/consulta-create.model';
import { TipoFoto } from '../models/tipo-foto';
import { AvaliacaoFisicaDTO, QuestionarioEstiloVidaDTO } from '../models/paciente.model';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/consultas`;
  private readonly apiPhotoUrl = `${environment.apiUrl}/api/v1/registro-fotografico`;

  // ===============================
  // CRUD Consultas
  // ===============================
  criar(pacienteId: number, dto: CriarConsultaDTO): Observable<ConsultaDetalhadaDTO> {
    return this.http.post<ConsultaDetalhadaDTO>(`${this.apiUrl}/paciente/${pacienteId}`, dto);
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

  // ===============================
  // Upload de Fotos
  // ===============================
  uploadFotos(consultaId: number, fotos: Record<TipoFoto, File | null>): Observable<void> {
    const formData = new FormData();

    if (fotos.ANTERIOR) formData.append('fotoAnterior', fotos.ANTERIOR);
    if (fotos.POSTERIOR) formData.append('fotoPosterior', fotos.POSTERIOR);
    if (fotos.LATERAL_ESQUERDA) formData.append('fotoLateralEsquerda', fotos.LATERAL_ESQUERDA);
    if (fotos.LATERAL_DIREITA) formData.append('fotoLateralDireita', fotos.LATERAL_DIREITA);

    return this.http.post<void>(`${this.apiPhotoUrl}/consulta/${consultaId}`, formData);
  }

  // ===============================
  // Buscar Fotos
  // ===============================
  getFotos(consultaId: number): Observable<Record<TipoFoto, string | null>> {
    return this.http
      .get<Record<string, string | null>>(`${this.apiPhotoUrl}/consulta/${consultaId}`)
      .pipe(
        map((res) => {
          const fotos = {
            ANTERIOR: res['fotoAnterior'] || null,
            POSTERIOR: res['fotoPosterior'] || null,
            LATERAL_ESQUERDA: res['fotoLateralEsquerda'] || null,
            LATERAL_DIREITA: res['fotoLateralDireita'] || null,
          };
          console.log('Fotos carregadas:', fotos);
          return fotos;
        })
      );
  }

  // ===============================
  // Salvar Questionário de Estilo de Vida
  // ===============================
  salvarQuestionario(
    consultaId: number,
    questionario: QuestionarioEstiloVidaDTO
  ): Observable<QuestionarioEstiloVidaDTO> {
    const apiUrl = `${environment.apiUrl}/api/v1/questionario`;
    return this.http.post<QuestionarioEstiloVidaDTO>(
      `${apiUrl}/consulta/${consultaId}`,
      questionario
    );
  }

  // ===============================
  // Salvar Avaliação Física
  // ===============================
  salvarAvaliacao(
    consultaId: number,
    avaliacao: AvaliacaoFisicaDTO
  ): Observable<AvaliacaoFisicaDTO> {
    const apiUrl = `${environment.apiUrl}/api/v1/avaliacoes`;
    return this.http.post<AvaliacaoFisicaDTO>(`${apiUrl}/consulta/${consultaId}`, avaliacao);
  }
}
