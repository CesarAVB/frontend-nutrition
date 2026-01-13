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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.carregarPaciente(id);
      this.carregarConsultas(id);
    }
  }

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

  carregarConsultas(pacienteId: number): void {
    this.consultaService.listarPorPaciente(pacienteId).subscribe({
      next: (consultas) => {
        this.consultas.set(consultas);
      },
      error: (erro) => {
        console.error('Erro ao carregar consultas:', erro);
        this.toastService.error('Erro ao carregar histórico de consultas');
      }
    });
  }

  novaConsulta(): void {
    const pacienteId = this.paciente()?.id;
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId, 'consulta']);
    }
  }

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

  verConsulta(consultaId: number): void {
    this.router.navigate(['/consultas', consultaId]);
  }

  abrirWhatsApp(telefone: string): void {
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  }

  confirmarExclusao(): void {
    this.mostrarModalExclusao.set(true);
  }

  cancelarExclusao(): void {
    this.mostrarModalExclusao.set(false);
  }

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

  voltar(): void {
    this.router.navigate(['/pacientes']);
  }

  // Métodos auxiliares para o template
  getIniciais(nome: string): string {
    const partes = nome.split(' ').filter(p => p.length > 0);
    if (partes.length === 0) return 'NN';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarData(dataISO?: string): string {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

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

  extrairDia(dataISO: string): string {
    const data = new Date(dataISO);
    return data.getDate().toString().padStart(2, '0');
  }

  extrairMes(dataISO: string): string {
    const data = new Date(dataISO);
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
                   'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return meses[data.getMonth()];
  }
}