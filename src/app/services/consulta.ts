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
    return this.http
      .post<ConsultaDetalhadaDTO>(`${this.apiUrl}/paciente/${pacienteId}`, dto)
      .pipe(
        map((res: any) => this.normalizeConsultaDetalhada(res))
      );
  }

  listarPorPaciente(pacienteId: number): Observable<ConsultaResumoDTO[]> {
    return this.http
      .get<ConsultaResumoDTO[]>(`${this.apiUrl}/paciente/${pacienteId}`)
      .pipe(
        map((arr: any[]) =>
          arr.map((item: any) => {
            const raw = item.dataConsulta || item.data_consulta || item.createdAt || item.created_at || item.create_at || null;
            return {
              ...item,
              dataConsulta: this.normalizeDateValue(raw),
              // Garantir campos usados na listagem
              peso:
                item.peso ?? item.pesoAtual ?? item.avaliacaoFisica?.pesoAtual ?? null,
              percentualGordura:
                item.percentualGordura ?? item.percentual_gordura ?? item.avaliacaoFisica?.percentualGordura ?? null,
              objetivo: item.objetivo ?? item.questionario?.objetivo ?? item.questionarioEstiloVida?.objetivo ?? null,
            };
          })
        )
      );
  }

  buscarCompleta(id: number): Observable<ConsultaDetalhadaDTO> {
    return this.http
      .get<ConsultaDetalhadaDTO>(`${this.apiUrl}/${id}`)
      .pipe(map((res: any) => this.normalizeConsultaDetalhada(res)));
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
    return this.http
      .get<ConsultaResumoDTO[]>(`${this.apiUrl}`)
      .pipe(
        map((arr: any[]) =>
          arr.map((item: any) => {
            const raw = item.dataConsulta || item.data_consulta || item.createdAt || item.created_at || item.create_at || null;
            return {
              ...item,
              dataConsulta: this.normalizeDateValue(raw),
              peso:
                item.peso ?? item.pesoAtual ?? item.avaliacaoFisica?.pesoAtual ?? null,
              percentualGordura:
                item.percentualGordura ?? item.percentual_gordura ?? item.avaliacaoFisica?.percentualGordura ?? null,
              objetivo: item.objetivo ?? item.questionario?.objetivo ?? item.questionarioEstiloVida?.objetivo ?? null,
            };
          })
        )
      );
  }

  atualizarData(id: number, novaData: string): Observable<ConsultaResumoDTO> {
    return this.http.put<ConsultaResumoDTO>(`${this.apiUrl}/${id}/data?novaData=${novaData}`, {});
  }

  atualizar(id: number, dto: CriarConsultaDTO): Observable<ConsultaDetalhadaDTO> {
    return this.http
      .put<ConsultaDetalhadaDTO>(`${this.apiUrl}/${id}`, dto)
      .pipe(map((res: any) => this.normalizeConsultaDetalhada(res)));
  }

  // Normaliza respostas da API para garantir que o frontend sempre leia `dataConsulta`
  private normalizeConsultaDetalhada(res: any): ConsultaDetalhadaDTO {
    if (!res) return res;
    const raw = res.dataConsulta || res.data_consulta || res.createdAt || res.created_at || res.create_at || null;
    const data = this.normalizeDateValue(raw);
    return { ...res, dataConsulta: data } as ConsultaDetalhadaDTO;
  }

  // Aceita várias formas de data vindas do backend e retorna string ISO ou null
  private normalizeDateValue(value: any): string | null {
    if (!value && value !== 0) return null;

    // Se já for string, retornar trimmed
    if (typeof value === 'string') {
      return value.trim();
    }

    // Se for número (timestamp em ms ou s), tentar criar Date
    if (typeof value === 'number') {
      // tratar como timestamp em ms se maior que 1e12, senão em s
      const asMs = value > 1e12 ? value : value * 1000;
      const d = new Date(asMs);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }

    // Se for array com componentes [YYYY, M, D, h?, m?, s?]
    if (Array.isArray(value) && value.length >= 3) {
      const [y, m, d, h = 0, min = 0, s = 0] = value.map((v: any) => Number(v));
      // Backend provavelmente usa mês 1-12; JS Date month é 0-11
      const dateObj = new Date(y, (m || 1) - 1, d, h, min, s);
      return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
    }

    return null;
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

  /**
   * Atualiza fotos da consulta
   * @param consultaId ID da consulta
   * @param fotos Objeto com arquivos das fotos { ANTERIOR, POSTERIOR, LATERAL_ESQUERDA, LATERAL_DIREITA }
   * @param remocoes Opcional - Indica quais fotos remover { ANTERIOR, POSTERIOR, LATERAL_ESQUERDA, LATERAL_DIREITA }
   */
  atualizarFotos(
    consultaId: number, 
    fotos: Record<TipoFoto, File | null>,
    remocoes?: Record<TipoFoto, boolean>
  ): Observable<void> {
    const formData = new FormData();

    // Adicionar arquivos de fotos
    if (fotos.ANTERIOR) formData.append('fotoAnterior', fotos.ANTERIOR);
    if (fotos.POSTERIOR) formData.append('fotoPosterior', fotos.POSTERIOR);
    if (fotos.LATERAL_ESQUERDA) formData.append('fotoLateralEsquerda', fotos.LATERAL_ESQUERDA);
    if (fotos.LATERAL_DIREITA) formData.append('fotoLateralDireita', fotos.LATERAL_DIREITA);

    // Adicionar QueryParams para remoções
    let params = new HttpParams();
    if (remocoes) {
      if (remocoes['ANTERIOR']) params = params.set('removerFotoAnterior', 'true');
      if (remocoes['POSTERIOR']) params = params.set('removerFotoPosterior', 'true');
      if (remocoes['LATERAL_ESQUERDA']) params = params.set('removerFotoLateralEsquerda', 'true');
      if (remocoes['LATERAL_DIREITA']) params = params.set('removerFotoLateralDireita', 'true');
    }

    return this.http.put<void>(`${this.apiPhotoUrl}/consulta/${consultaId}`, formData, { params });
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

  atualizarQuestionario(
    consultaId: number,
    questionario: QuestionarioEstiloVidaDTO
  ): Observable<QuestionarioEstiloVidaDTO> {
    const apiUrl = `${environment.apiUrl}/api/v1/questionario`;
    return this.http.put<QuestionarioEstiloVidaDTO>(
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
    const url = `${apiUrl}/consulta/${consultaId}`;
    return this.http.post<AvaliacaoFisicaDTO>(url, avaliacao);
  }

  atualizarAvaliacao(
    consultaId: number,
    avaliacao: AvaliacaoFisicaDTO
  ): Observable<AvaliacaoFisicaDTO> {
    const apiUrl = `${environment.apiUrl}/api/v1/avaliacoes`;
    const url = `${apiUrl}/consulta/${consultaId}`;
    return this.http.put<AvaliacaoFisicaDTO>(url, avaliacao);
  }
}