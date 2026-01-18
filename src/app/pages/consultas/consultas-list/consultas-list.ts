import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta';
import { ConsultaResumoDTO } from '../../../models/consulta.model';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-consultas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-list.html',
  styleUrl: './consultas-list.scss'
})
export class ConsultasListComponent implements OnInit {
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private toastService = inject(ToastService);

  consultas = signal<ConsultaResumoDTO[]>([]);
  searchTerm = signal('');
  isLoading = signal(true);
  error = signal<string | null>(null);

  consultasFiltradas = computed(() => {
    const termo = this.searchTerm().toLowerCase().trim();
    const lista = this.consultas();
    
    if (!termo) return lista;

    return lista.filter(c => 
      c.nomePaciente.toLowerCase().includes(termo) ||
      c.id.toString().includes(termo)
    );
  });

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
        this.toastService.error('Erro ao carregar consultas. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/consultas', id]);
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
}