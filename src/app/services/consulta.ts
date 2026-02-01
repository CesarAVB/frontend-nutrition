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

  // =======================================
  // # criar - Cria uma nova consulta para um paciente
  // =======================================
  criar(pacienteId: number, dto: CriarConsultaDTO): Observable<ConsultaDetalhadaDTO> {
    return this.http
      .post<ConsultaDetalhadaDTO>(`${this.apiUrl}/paciente/${pacienteId}`, dto)
      .pipe(
        map((res: any) => this.normalizeConsultaDetalhada(res))
      );
  }

  // =======================================
  // # listarPorPaciente - Lista todas as consultas de um paciente
  // =======================================
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

  // =======================================
  // # buscarCompleta - Busca uma consulta completa por ID
  // =======================================
  buscarCompleta(id: number): Observable<ConsultaDetalhadaDTO> {
    return this.http
      .get<ConsultaDetalhadaDTO>(`${this.apiUrl}/${id}`)
      .pipe(map((res: any) => this.normalizeConsultaDetalhada(res)));
  }

  // =======================================
  // # comparar - Compara duas consultas de um paciente
  // =======================================
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

  // =======================================
  // # deletar - Deleta uma consulta por ID
  // =======================================
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // =======================================
  // # listarTodas - Lista todas as consultas do sistema
  // =======================================
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

  // =======================================
  // # atualizarData - Atualiza a data de uma consulta
  // =======================================
  atualizarData(id: number, novaData: string): Observable<ConsultaResumoDTO> {
    return this.http.put<ConsultaResumoDTO>(`${this.apiUrl}/${id}/data?novaData=${novaData}`, {});
  }

  // =======================================
  // # atualizar - Atualiza uma consulta completa
  // =======================================
  atualizar(id: number, dto: CriarConsultaDTO): Observable<ConsultaDetalhadaDTO> {
    return this.http
      .put<ConsultaDetalhadaDTO>(`${this.apiUrl}/${id}`, dto)
      .pipe(map((res: any) => this.normalizeConsultaDetalhada(res)));
  }

  // ===========================================
  // # normalizeConsultaDetalhada - Normaliza dados de consulta detalhada
  // ===========================================
  private normalizeConsultaDetalhada(res: any): ConsultaDetalhadaDTO {
    if (!res) return res;
    const raw = res.dataConsulta || res.data_consulta || res.createdAt || res.created_at || res.create_at || null;
    const data = this.normalizeDateValue(raw);
    return { ...res, dataConsulta: data } as ConsultaDetalhadaDTO;
  }

  // ===========================================
  // # normalizeDateValue - Normaliza valor de data
  // ===========================================
  private normalizeDateValue(value: any): string | null {
    if (!value && value !== 0) return null;

    if (typeof value === 'string') {
      return value.trim();
    }

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
  // # uploadFotos - Faz upload das fotos de uma consulta
  // =======================================
  uploadFotos(consultaId: number, fotos: Record<TipoFoto, File | null>): Observable<void> {
    const formData = new FormData();

    if (fotos.ANTERIOR) formData.append('fotoAnterior', fotos.ANTERIOR);
    if (fotos.POSTERIOR) formData.append('fotoPosterior', fotos.POSTERIOR);
    if (fotos.LATERAL_ESQUERDA) formData.append('fotoLateralEsquerda', fotos.LATERAL_ESQUERDA);
    if (fotos.LATERAL_DIREITA) formData.append('fotoLateralDireita', fotos.LATERAL_DIREITA);

    return this.http.post<void>(`${this.apiPhotoUrl}/consulta/${consultaId}`, formData);
  }

  // =======================================
  // # atualizarFotos - Atualiza as fotos de uma consulta
  // =======================================
  atualizarFotos(
    consultaId: number,
    fotos: Record<TipoFoto, File | null>,
    remocoes?: Record<TipoFoto, boolean>
  ): Observable<void> {
    const formData = new FormData();

    if (fotos.ANTERIOR) formData.append('fotoAnterior', fotos.ANTERIOR);
    if (fotos.POSTERIOR) formData.append('fotoPosterior', fotos.POSTERIOR);
    if (fotos.LATERAL_ESQUERDA) formData.append('fotoLateralEsquerda', fotos.LATERAL_ESQUERDA);
    if (fotos.LATERAL_DIREITA) formData.append('fotoLateralDireita', fotos.LATERAL_DIREITA);

    let params = new HttpParams();
    if (remocoes) {
      if (remocoes['ANTERIOR']) params = params.set('removerFotoAnterior', 'true');
      if (remocoes['POSTERIOR']) params = params.set('removerFotoPosterior', 'true');
      if (remocoes['LATERAL_ESQUERDA']) params = params.set('removerFotoLateralEsquerda', 'true');
      if (remocoes['LATERAL_DIREITA']) params = params.set('removerFotoLateralDireita', 'true');
    }

    return this.http.put<void>(`${this.apiPhotoUrl}/consulta/${consultaId}`, formData, { params });
  }

  // =======================================
  // # getFotos - Busca as fotos de uma consulta
  // =======================================
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

  // =======================================
  // # salvarQuestionario - Salva o questionário de estilo de vida
  // =======================================
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

  // =======================================
  // # atualizarQuestionario - Atualiza o questionário de estilo de vida
  // =======================================
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

  // =======================================
  // # salvarAvaliacao - Salva a avaliação física
  // =======================================
  salvarAvaliacao(
    consultaId: number,
    avaliacao: AvaliacaoFisicaDTO
  ): Observable<AvaliacaoFisicaDTO> {
    const apiUrl = `${environment.apiUrl}/api/v1/avaliacoes`;
    const url = `${apiUrl}/consulta/${consultaId}`;
    return this.http.post<AvaliacaoFisicaDTO>(url, avaliacao);
  }

  // =======================================
  // # atualizarAvaliacao - Atualiza a avaliação física
  // =======================================
  atualizarAvaliacao(
    consultaId: number,
    avaliacao: AvaliacaoFisicaDTO
  ): Observable<AvaliacaoFisicaDTO> {
    const apiUrl = `${environment.apiUrl}/api/v1/avaliacoes`;
    const url = `${apiUrl}/consulta/${consultaId}`;
    return this.http.put<AvaliacaoFisicaDTO>(url, avaliacao);
  }

  // =======================================
  // # enviarDadosTesteComN8n - Envia a consulta para endpoint de teste N8n
  // =======================================
  enviarDadosTesteComN8n(consulta: ConsultaDetalhadaDTO): Observable<any> {
    const url = `${environment.apiUrl}/api/v1/relatorio/testeComN8n`;
    return this.http.post<any>(url, consulta, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}