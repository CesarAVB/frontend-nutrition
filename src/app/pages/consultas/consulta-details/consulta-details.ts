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
  mostrarModalTemplate = signal(false);
  novaData = signal('');
  templateType = signal<'padrao' | 'simples' | 'detalhado'>('padrao');
  fotoAmpliada = signal<string | null>(null);
  tituloFotoAmpliada = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.carregarConsulta(id);
    }
  }

  carregarConsulta(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.consultaService.buscarCompleta(id).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);
        
        // Carregar fotos se houver registro fotográfico
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

  carregarFotos(consultaId: number): void {
    this.consultaService.getFotos(consultaId).subscribe({
      next: (fotos) => {
        this.fotos.set(fotos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar fotos:', err);
        // Não exibir erro, apenas continuar sem fotos
        this.isLoading.set(false);
      }
    });
  }

  voltar(): void {
    const pacienteId = this.consulta()?.pacienteId;
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId]);
    } else {
      this.router.navigate(['/consultas']);
    }
  }

  editarConsulta(): void {
    const consultaId = this.consulta()?.id;
    const pacienteId = this.consulta()?.pacienteId;
    if (consultaId && pacienteId) {
      this.router.navigate(['/pacientes', pacienteId, 'consulta'], {
        queryParams: { consultaId }
      });
    }
  }

  confirmarExclusao(): void {
    this.mostrarModalExclusao.set(true);
  }

  cancelarExclusao(): void {
    this.mostrarModalExclusao.set(false);
  }

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

  abrirModalRemarcar(): void {
    const dataAtual = this.consulta()?.dataConsulta;
    if (dataAtual) {
      // Converter data ISO para formato datetime-local (YYYY-MM-DDTHH:mm)
      const data = new Date(dataAtual);
      const dataFormatada = data.toISOString().slice(0, 16);
      this.novaData.set(dataFormatada);
    }
    this.mostrarModalRemarcar.set(true);
  }

  cancelarRemarcar(): void {
    this.mostrarModalRemarcar.set(false);
    this.novaData.set('');
  }

  remarcarConsulta(): void {
    const consultaId = this.consulta()?.id;
    const data = this.novaData();
    
    if (!consultaId || !data) {
      this.toastService.warning('Por favor, selecione uma data válida.');
      return;
    }

    this.isLoading.set(true);

    // Converter para ISO 8601 com timezone
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

  ampliarFoto(url: string, titulo: string): void {
    console.log('ampliarFoto chamado:', url, titulo);
    this.fotoAmpliada.set(url);
    this.tituloFotoAmpliada.set(titulo);
    console.log('fotoAmpliada signal:', this.fotoAmpliada());
  }

  fecharFotoAmpliada(): void {
    this.fotoAmpliada.set(null);
    this.tituloFotoAmpliada.set('');
  }

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

  calcularIMC(peso?: number, altura?: number): string {
    if (!peso || !altura || altura === 0) return '-';
    const imc = peso / (altura * altura);
    if (isNaN(imc) || !isFinite(imc)) return '-';
    return imc.toFixed(1);
  }

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

  gerarPDF(): void {
    this.mostrarModalTemplate.set(true);
  }

  abrirModalTemplate(): void {
    this.mostrarModalTemplate.set(true);
  }

  cancelarTemplate(): void {
    this.mostrarModalTemplate.set(false);
    this.templateType.set('padrao');
  }

  confirmarTemplate(): void {
    const consulta = this.consulta();
    if (!consulta) {
      this.toastService.error('Consulta não encontrada');
      return;
    }

    this.mostrarModalTemplate.set(false);
    this.toastService.info('Gerando relatório...');

    // Fazer requisição POST para o endpoint do backend
    const url = `${environment.apiUrl}/api/v1/relatorio`;
    
    const payload = {
      pacienteId: consulta.pacienteId,
      consultaId: consulta.id,
      templateType: this.templateType()
    };
    
    this.http.post(url, payload, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (blob: Blob) => {
        // Criar URL para o blob e fazer download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-consulta-${consulta.nomePaciente.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.toastService.success('Relatório gerado com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao gerar relatório:', error);
        this.toastService.error('Erro ao gerar relatório. Tente novamente.');
      }
    });
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