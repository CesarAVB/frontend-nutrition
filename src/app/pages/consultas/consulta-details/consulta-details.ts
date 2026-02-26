import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta';
import { ToastService } from '../../../services/toast';
import { ConsultaDetalhadaDTO } from '../../../models/consulta.model';
import { TipoFoto } from '../../../models/tipo-foto';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-consulta-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consulta-details.html',
  styleUrls: ['./consulta-details.scss']
})
export class ConsultaDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  consulta = signal<ConsultaDetalhadaDTO | null>(null);
  fotos = signal<Record<TipoFoto, string | null>>({
    ANTERIOR: null,
    POSTERIOR: null,
    LATERAL_ESQUERDA: null,
    LATERAL_DIREITA: null
  });
  isLoading = signal(true);
  error = signal<string | null>(null);
  mostrarModalExclusao = signal(false);
  mostrarModalRemarcar = signal(false);
  novaData = signal('');
  isGeneratingReport = signal(false);
  fotoAmpliada = signal<string | null>(null);
  tituloFotoAmpliada = signal<string>('');

  // Controle de collapse dos cards
  cardAvaliacaoFisica = signal(false);
  cardPerimetros = signal(false);
  cardDobras = signal(false);
  cardEstiloVida = signal(false);
  cardHabitos = signal(false);
  cardAlimentar = signal(false);
  cardSaude = signal(false);
  cardFotos = signal(false);

  // Controle de expansão das seções
  expandirPerimetros = signal(false);
  expandirDobras = signal(false);
  expandirSaude = signal(false);

  // ===========================================
  // # ngOnInit - Inicializa o componente
  // ===========================================
  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.carregarConsulta(id);
    }
  }

  // ===========================================
  // # carregarConsulta - Carrega dados da consulta
  // ===========================================
  carregarConsulta(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.consultaService.buscarCompleta(id).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);

        if (consulta.registroFotografico) {
          this.carregarFotos(id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar consulta:', err);
        this.toastService.error('Erro ao carregar dados da consulta');
        this.isLoading.set(false);
        this.voltar();
      }
    });
  }

  // ===========================================
  // # carregarFotos - Carrega fotos da consulta
  // ===========================================
  carregarFotos(consultaId: number): void {
    this.consultaService.getFotos(consultaId).subscribe({
      next: (fotos) => {
        this.fotos.set(fotos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar fotos:', err);
        this.isLoading.set(false);
      }
    });
  }

  // ===========================================
  // # voltar - Navega de volta
  // ===========================================
  voltar(): void {
    const pacienteId = this.consulta()?.pacienteId;
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId]);
    } else {
      this.router.navigate(['/consultas']);
    }
  }

  // ===========================================
  // # editarConsulta - Navega para edição da consulta
  // ===========================================
  editarConsulta(): void {
    const consultaId = this.consulta()?.id;
    const pacienteId = this.consulta()?.pacienteId;
    if (consultaId && pacienteId) {
      this.router.navigate(['/pacientes', pacienteId, 'consulta'], {
        queryParams: { consultaId }
      });
    }
  }

  // ===========================================
  // # confirmarExclusao - Confirma exclusão da consulta
  // ===========================================
  confirmarExclusao(): void {
    this.mostrarModalExclusao.set(true);
  }

  // ===========================================
  // # cancelarExclusao - Cancela exclusão da consulta
  // ===========================================
  cancelarExclusao(): void {
    this.mostrarModalExclusao.set(false);
  }

  // ===========================================
  // # excluirConsulta - Exclui a consulta
  // ===========================================
  excluirConsulta(): void {
    const consultaId = this.consulta()?.id;
    if (!consultaId) return;

    this.isLoading.set(true);
    
    this.consultaService.deletar(consultaId).subscribe({
      next: () => {
        this.toastService.success('Consulta excluída com sucesso!');
        this.voltar();
      },
      error: (erro) => {
        console.error('Erro ao excluir consulta:', erro);
        this.toastService.error('Erro ao excluir consulta. Tente novamente.');
        this.isLoading.set(false);
        this.mostrarModalExclusao.set(false);
      }
    });
  }

  // ===========================================
  // # abrirModalRemarcar - Abre modal para remarcar consulta
  // ===========================================
  abrirModalRemarcar(): void {
    const dataAtual = this.consulta()?.dataConsulta;
    if (dataAtual) {
      const data = new Date(dataAtual);
      const dataFormatada = data.toISOString().slice(0, 16);
      this.novaData.set(dataFormatada);
    }
    this.mostrarModalRemarcar.set(true);
  }

  // ===========================================
  // # cancelarRemarcar - Cancela remarcação da consulta
  // ===========================================
  cancelarRemarcar(): void {
    this.mostrarModalRemarcar.set(false);
    this.novaData.set('');
  }

  // ===========================================
  // # remarcarConsulta - Remarca a consulta
  // ===========================================
  remarcarConsulta(): void {
    const consultaId = this.consulta()?.id;
    const data = this.novaData();
    
    if (!consultaId || !data) {
      this.toastService.warning('Por favor, selecione uma data válida.');
      return;
    }

    this.isLoading.set(true);

    const dataISO = new Date(data).toISOString();

    this.consultaService.atualizarData(consultaId, dataISO).subscribe({
      next: () => {
        this.toastService.success('Consulta remarcada com sucesso!');
        this.carregarConsulta(consultaId);
        this.mostrarModalRemarcar.set(false);
        this.novaData.set('');
      },
      error: (err) => {
        console.error('Erro ao remarcar consulta:', err);
        this.toastService.error('Erro ao remarcar consulta. Tente novamente.');
        this.isLoading.set(false);
        this.mostrarModalRemarcar.set(false);
      }
    });
  }

  // ===========================================
  // # ampliarFoto - Amplia foto para visualização
  // ===========================================
  ampliarFoto(url: string, titulo: string): void {
    console.log('ampliarFoto chamado:', url, titulo);
    this.fotoAmpliada.set(url);
    this.tituloFotoAmpliada.set(titulo);
    console.log('fotoAmpliada signal:', this.fotoAmpliada());
  }

  // ===========================================
  // # fecharFotoAmpliada - Fecha foto ampliada
  // ===========================================
  fecharFotoAmpliada(): void {
    this.fotoAmpliada.set(null);
    this.tituloFotoAmpliada.set('');
  }

  // ===========================================
  // # formatarData - Formata data para exibição
  // ===========================================
  formatarData(dataISO: string): string {
    if (!dataISO) return '-';
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  // ===========================================
  // # calcularIMC - Calcula IMC
  // ===========================================
  calcularIMC(peso?: number, altura?: number): string {
    if (!peso || !altura || altura === 0) return '-';
    const imc = peso / (altura * altura);
    if (isNaN(imc) || !isFinite(imc)) return '-';
    return imc.toFixed(1);
  }

  // ===========================================
  // # getClassificacaoIMC - Obtém classificação do IMC
  // ===========================================
  getClassificacaoIMC(peso?: number, altura?: number): string {
    if (!peso || !altura || altura === 0) return '';
    const imc = peso / (altura * altura);
    
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade Grau I';
    if (imc < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  }

  // ===========================================
  // # gerarPDF - Inicia geração de PDF
  // ===========================================
  gerarPDF(): void {
    // Gera diretamente o relatório detalhado
    this.gerarRelatorioDetalhado();
  }

  // ===========================================
  // # gerarRelatorioDetalhado - Gera relatório detalhado e faz download
  // ===========================================
  gerarRelatorioDetalhado(): void {
    const consulta = this.consulta();
    if (!consulta) {
      this.toastService.error('Consulta não encontrada');
      return;
    }

    this.isGeneratingReport.set(true);
    this.toastService.info('Gerando relatório detalhado...');

    const url = `${environment.apiUrl}/api/v1/relatorio`;
    const payload = {
      pacienteId: consulta.pacienteId,
      consultaId: consulta.id,
      templateType: 'detalhado'
    };

    this.http.post(url, payload, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.gerarNomeArquivoRelatorio(consulta.nomePaciente, 'detalhado');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.toastService.success('Relatório gerado com sucesso!');
        this.isGeneratingReport.set(false);
      },
      error: (error) => {
        console.error('Erro ao gerar relatório:', error);
        this.toastService.error('Erro ao gerar relatório. Tente novamente.');
        this.isGeneratingReport.set(false);
      }
    });
  }

  // ===========================================
  // # testeIA - Solicita senha e envia dados para endpoint de teste
  // ===========================================
  testeIA(): void {
    const senha = window.prompt('Informe a senha para Teste I.A.:');
    if (senha === null) return; // usuário cancelou
    if (senha !== '550760') {
      this.toastService.error('Senha incorreta');
      return;
    }

    const consulta = this.consulta();
    if (!consulta) {
      this.toastService.error('Consulta não encontrada');
      return;
    }

    this.isGeneratingReport.set(true);
    this.toastService.info('Enviando dados para Teste I.A...');

    this.consultaService.enviarDadosTesteComN8n(consulta).subscribe({
      next: (res) => {
        console.log('Resposta backend Teste I.A.:', res);

        try {
          // Se o backend retornou base64, converte e dispara download
          if (res && res.format === 'base64' && res.response) {
            const base64 = res.response as string;
            const filename = res.filename || 'download.pdf';
            const contentType = (res.meta && (res.meta['content-type'] || res.meta.contentType)) || 'application/pdf';

            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            // Cria link para download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Também abre em nova aba (pré-visualização) se o navegador permitir
            try {
              window.open(url, '_blank');
            } catch {}

            // limpa URL
            window.URL.revokeObjectURL(url);

            this.toastService.success('Arquivo preparado para download.');
          } else {
            this.toastService.success('Dados enviados com sucesso para Teste I.A.');
            console.log('Resposta não é base64 ou está em formato inesperado.');
          }
        } catch (e) {
          console.error('Erro ao processar resposta Teste I.A.:', e);
          this.toastService.error('Erro ao processar o arquivo retornado.');
        } finally {
          this.isGeneratingReport.set(false);
        }
      },
      error: (err) => {
        console.error('Erro ao enviar dados para Teste I.A.:', err);
        this.toastService.error('Erro ao enviar dados. Tente novamente.');
        this.isGeneratingReport.set(false);
      }
    });
  }

  // ===========================================
  // # gerarNomeArquivoRelatorio - Gera nome do arquivo de relatório
  // ===========================================
  private gerarNomeArquivoRelatorio(nomePaciente: string, tipo: 'padrao' | 'simples' | 'detalhado'): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const MM = String(now.getMonth() + 1).padStart(2, '0'); // Janeiro é 0
    const yy = String(now.getFullYear()).slice(-2); // Últimos 2 dígitos do ano
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${dd}${MM}${yy}${hh}${mm}`;

    const nomePacienteFormatado = nomePaciente.replace(/\s+/g, '-');
    return `relatorio-${nomePacienteFormatado}-${tipo}-${timestamp}.pdf`;
  }

  private getClassificacaoIMCFromValue(imc: number): string {
    if (imc < 18.5) return 'Baixo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  }
}