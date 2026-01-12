import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta';
import { ConsultaResumoDTO } from '../../../models/consulta.model';

@Component({
  selector: 'app-consultas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultas-list.html',
  styleUrls: ['./consultas-list.scss']
})
export class ConsultasListComponent implements OnInit {
  private router = inject(Router);
  private consultaService = inject(ConsultaService);

  consultas = signal<ConsultaResumoDTO[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.carregarConsultas();
  }

  carregarConsultas(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.consultaService.listarTodas().subscribe({
      next: (consultas) => {
        this.consultas.set(consultas);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar consultas:', err);
        this.error.set('Erro ao carregar consultas. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/consultas', id]);
  }

  formatarData(dataISO: string): string {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}