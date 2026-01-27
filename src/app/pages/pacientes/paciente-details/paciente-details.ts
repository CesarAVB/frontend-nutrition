// src/app/pages/pacientes/paciente-details/paciente-details.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../../services/paciente';
import { ConsultaService } from '../../../services/consulta';
import { PacienteDTO, ConsultaResumoDTO } from '../../../models/paciente.model';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-paciente-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-details.html',
  styleUrls: ['./paciente-details.scss']
})
export class PacienteDetailsComponent implements OnInit {
  private toastService = inject(ToastService);
  paciente = signal<PacienteDTO | null>(null);
  consultas = signal<ConsultaResumoDTO[]>([]);
  isLoading = signal(false);
  error = signal('');
  mostrarModalExclusao = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacienteService: PacienteService,
    private consultaService: ConsultaService
  ) {}

  // ===========================================
  // # ngOnInit - Inicializa o componente carregando dados do paciente e consultas
  // ===========================================
  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.carregarPaciente(id);
      this.carregarConsultas(id);
    }
  }

  // ===========================================
  // # carregarPaciente - Carrega os dados do paciente pelo ID
  // ===========================================
  carregarPaciente(id: number): void {
    this.isLoading.set(true);
    
    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        this.paciente.set(paciente);
        this.isLoading.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar paciente:', erro);
        this.toastService.error('Erro ao carregar dados do paciente');
        this.isLoading.set(false);
        this.router.navigate(['/pacientes']);
      }
    });
  }

  // ===========================================
  // # carregarConsultas - Carrega as consultas associadas ao paciente
  // ===========================================
  carregarConsultas(pacienteId: number): void {
    this.consultaService.listarPorPaciente(pacienteId).subscribe({
      next: (consultas) => {
        console.log('Consultas carregadas:', consultas);
        this.consultas.set(consultas);
      },
      error: (erro) => {
        console.error('Erro ao carregar consultas:', erro);
        this.toastService.error('Erro ao carregar histórico de consultas');
      }
    });
  }

  // ===========================================
  // # novaConsulta - Navega para a página de criação de nova consulta
  // ===========================================
  novaConsulta(): void {
    const pacienteId = this.paciente()?.id;
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId, 'consulta']);
    }
  }

  // ===========================================
  // # editarPaciente - Navega para a página de edição do paciente
  // ===========================================
  editarPaciente(): void {
    console.log('Método editarPaciente chamado');
    const pacienteAtual = this.paciente();
    console.log('Paciente atual:', pacienteAtual);
    
    const pacienteId = pacienteAtual?.id;
    console.log('ID do paciente:', pacienteId);
    
    if (pacienteId) {
      const rota = ['/pacientes', pacienteId, 'editar'];
      console.log('Navegando para:', rota);
      this.router.navigate(rota);
    } else {
      console.error('ID do paciente não encontrado');
      this.toastService.error('Erro: não foi possível identificar o paciente para edição.');
    }
  }

  // ===========================================
  // # verConsulta - Navega para os detalhes da consulta selecionada
  // ===========================================
  verConsulta(consultaId: number): void {
    this.router.navigate(['/consultas', consultaId]);
  }

  // ===========================================
  // # abrirWhatsApp - Abre o WhatsApp com o número de telefone fornecido
  // ===========================================
  abrirWhatsApp(telefone: string): void {
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  }

  // ===========================================
  // # confirmarExclusao - Exibe o modal de confirmação para exclusão do paciente
  // ===========================================
  confirmarExclusao(): void {
    this.mostrarModalExclusao.set(true);
  }

  // ===========================================
  // # cancelarExclusao - Fecha o modal de confirmação de exclusão
  // ===========================================
  cancelarExclusao(): void {
    this.mostrarModalExclusao.set(false);
  }

  // ===========================================
  // # excluirPaciente - Exclui o paciente do sistema
  // ===========================================
  excluirPaciente(): void {
    const pacienteId = this.paciente()?.id;
    if (!pacienteId) return;

    this.isLoading.set(true);
    
    this.pacienteService.deletar(pacienteId).subscribe({
      next: () => {
        this.toastService.success('Paciente excluído com sucesso!');
        this.router.navigate(['/pacientes']);
      },
      error: (erro) => {
        console.error('Erro ao excluir paciente:', erro);
        this.toastService.error('Erro ao excluir paciente. Tente novamente.');
        this.isLoading.set(false);
        this.mostrarModalExclusao.set(false);
      }
    });
  }

  // ===========================================
  // # voltar - Navega de volta para a lista de pacientes
  // ===========================================
  voltar(): void {
    this.router.navigate(['/pacientes']);
  }

  // ===========================================
  // # getIniciais - Retorna as iniciais do nome do paciente
  // ===========================================
  getIniciais(nome: string): string {
    const partes = nome.split(' ').filter(p => p.length > 0);
    if (partes.length === 0) return 'NN';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  // ===========================================
  // # formatarData - Formata a data ISO para o formato brasileiro
  // ===========================================
  formatarData(dataISO?: string): string {
    if (!dataISO) return '-';
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  // ===========================================
  // # calcularIdade - Calcula a idade do paciente baseada na data de nascimento
  // ===========================================
  calcularIdade(dataNascimento: string): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }

  // ===========================================
  // # extrairDia - Extrai o dia da data ISO
  // ===========================================
  extrairDia(dataISO: string): string {
    if (!dataISO) return '-';
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';
      return data.getDate().toString().padStart(2, '0');
    } catch {
      return '-';
    }
  }

  // ===========================================
  // # extrairMes - Extrai o mês da data ISO em formato abreviado
  // ===========================================
  extrairMes(dataISO: string): string {
    if (!dataISO) return '-';
    try {
      const data = new Date(dataISO);
      if (isNaN(data.getTime())) return '-';
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
                     'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      return meses[data.getMonth()];
    } catch {
      return '-';
    }
  }
}