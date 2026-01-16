import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, DashboardStatsDTO, ConsultaHojeDTO, PacienteDTO } from '../../services/dashboard';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly stats = signal<DashboardStatsDTO | null>(null);
  protected readonly consultasHoje = signal<ConsultaHojeDTO[]>([]);
  protected readonly pacientesRecentes = signal<PacienteDTO[]>([]);
  
  protected readonly loadingStats = signal(true);
  protected readonly loadingConsultas = signal(false);
  protected readonly loadingPacientes = signal(false);

  protected readonly isLoading = computed(() => 
    this.loadingStats() || this.loadingConsultas() || this.loadingPacientes()
  );

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    // Carregar estatísticas
    this.loadingStats.set(true);
    this.dashboardService.obterEstatisticas().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loadingStats.set(false);
      },
      error: (err) => {
        this.loadingStats.set(false);
        if (err.status === 400) {
          this.toastService.info(err.error.message || 'Sem dados para exibir');
        } else {
          this.toastService.error('Erro ao carregar estatísticas');
        }
        this.stats.set(null);
      }
    });

    // Carregar consultas de hoje
    this.loadingConsultas.set(true);
    this.dashboardService.consultasHoje().subscribe({
      next: (consultas) => {
        this.consultasHoje.set(consultas);
        this.loadingConsultas.set(false);
      },
      error: (err) => {
        this.loadingConsultas.set(false);
        if (err.status === 400) {
          this.toastService.info(err.error.message || 'Nenhuma consulta agendada para hoje');
        } else {
          this.toastService.error('Erro ao carregar consultas');
        }
        this.consultasHoje.set([]);
      }
    });

    // Carregar pacientes recentes
    this.loadingPacientes.set(true);
    this.dashboardService.pacientesRecentes(5).subscribe({
      next: (pacientes) => {
        this.pacientesRecentes.set(pacientes);
        this.loadingPacientes.set(false);
      },
      error: (err) => {
        this.loadingPacientes.set(false);
        if (err.status === 400) {
          this.toastService.info(err.error.message || 'Nenhum paciente encontrado');
        } else {
          this.toastService.error('Erro ao carregar pacientes');
        }
        this.pacientesRecentes.set([]);
      }
    });
  }

  protected recarregar(): void {
    this.carregarDados();
  }

  protected verTodosPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  protected verDetalhesPaciente(id: number): void {
    this.router.navigate(['/pacientes', id.toString()]);
  }

  protected novoPaciente(): void {
    this.router.navigate(['/pacientes/novo']);
  }

  protected getIniciais(nomeCompleto: string): string {
    return nomeCompleto
      .split(' ')
      .map(nome => nome.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  protected formatarData(data: string | null | undefined): string {
    if (!data) return 'Sem registro';
    
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  protected ligarPaciente(telefone: string | null | undefined, event: Event): void {
    event.stopPropagation();
    if (!telefone) {
      this.toastService.warning('Paciente sem telefone cadastrado');
      return;
    }
    
    const telefoneFormatado = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${telefoneFormatado}`, '_blank');
  }
}