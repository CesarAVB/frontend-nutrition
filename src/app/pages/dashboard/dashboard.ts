// dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats, ConsultaHoje } from '../../services/dashboard';
import { PacienteDTO } from '../../models/paciente.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats>({
    totalPacientes: 0,
    consultasHoje: 0,
    consultasMes: 0,
    proximaConsulta: '-'
  });

  consultasHoje = signal<ConsultaHoje[]>([]);
  pacientesRecentes = signal<PacienteDTO[]>([]);
  isLoading = signal(false);

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.isLoading.set(true);
    
    forkJoin({
      stats: this.dashboardService.buscarEstatisticas(),
      consultas: this.dashboardService.buscarConsultasHoje(),
      pacientes: this.dashboardService.buscarPacientesRecentes()
    }).subscribe({
      next: (resultado) => {
        this.stats.set(resultado.stats);
        this.consultasHoje.set(resultado.consultas);
        this.pacientesRecentes.set(resultado.pacientes);
        this.isLoading.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar dados:', erro);
        this.isLoading.set(false);
      }
    });
  }

  getIniciais(nome: string): string {
    const partes = nome.split(' ').filter(p => p.length > 0);
    if (partes.length === 0) return 'NN';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  formatarData(dataISO?: string): string {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  verTodosPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  novoPaciente(): void {
    this.router.navigate(['/pacientes/novo']);
  }

  ligarPaciente(telefone: string): void {
    if (!telefone) return;
    window.open(`https://wa.me/55${telefone.replace(/\D/g, '')}`, '_blank');
  }

  verDetalhesPaciente(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }
}