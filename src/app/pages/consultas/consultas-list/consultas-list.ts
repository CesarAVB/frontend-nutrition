import { Component, OnDestroy, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class ConsultasListComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private consultaService = inject(ConsultaService);
  private toastService = inject(ToastService);

  consultas = signal<ConsultaResumoDTO[]>([]);
  searchTerm = signal('');
  searchTermAplicado = signal('');
  isLoading = signal(true);
  error = signal<string | null>(null);
  paginaAtual = signal(0);
  tamanhoPagina = signal(10);
  totalPaginas = signal(0);
  totalItens = signal(0);
  pacienteIdFiltro = signal<number | null>(null);
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  consultasFiltradas = computed(() => {
    const termo = this.searchTermAplicado().toLowerCase().trim();
    const lista = this.consultas();
    
    if (!termo) return lista;

    return lista.filter(c => 
      c.nomePaciente.toLowerCase().includes(termo) ||
      c.id.toString().includes(termo)
    );
  });

  // ===========================================
  // # ngOnInit - Inicializa o componente
  // ===========================================
  ngOnInit(): void {
    const pacienteId = Number(this.route.snapshot.queryParamMap.get('pacienteId'));
    this.pacienteIdFiltro.set(Number.isFinite(pacienteId) ? pacienteId : null);
    this.carregarConsultas(0);
  }

  ngOnDestroy(): void {
    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
      this.debounceHandle = null;
    }
  }

  // ===========================================
  // # carregarConsultas - Carrega lista de consultas
  // ===========================================
  carregarConsultas(page = this.paginaAtual()): void {
    this.isLoading.set(true);
    this.error.set(null);

    const pacienteId = this.pacienteIdFiltro();
    const request$ = pacienteId
      ? this.consultaService.listarPorPacientePaginado(pacienteId, page, this.tamanhoPagina(), 'dataConsulta', 'desc')
      : this.consultaService.listarTodasPaginado(page, this.tamanhoPagina(), 'dataConsulta', 'desc');
    
    request$.subscribe({
      next: (resposta) => {
        this.consultas.set(resposta.content);
        this.paginaAtual.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalItens.set(resposta.totalElements);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar consultas:', err);
        this.toastService.error('Erro ao carregar consultas. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  // ===========================================
  // # onSearchTermChange - Atualiza termo aplicado com debounce
  // ===========================================
  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);

    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
    }

    this.debounceHandle = setTimeout(() => {
      this.searchTermAplicado.set(value);
    }, 350);
  }

  // ===========================================
  // # paginaAnterior - Navega para a página anterior
  // ===========================================
  paginaAnterior(): void {
    if (this.paginaAtual() <= 0 || this.isLoading()) return;
    this.carregarConsultas(this.paginaAtual() - 1);
  }

  // ===========================================
  // # proximaPagina - Navega para a próxima página
  // ===========================================
  proximaPagina(): void {
    if (this.paginaAtual() >= this.totalPaginas() - 1 || this.isLoading()) return;
    this.carregarConsultas(this.paginaAtual() + 1);
  }

  // ===========================================
  // # irParaPagina - Navega para página específica
  // ===========================================
  irParaPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas() || page === this.paginaAtual() || this.isLoading()) return;
    this.carregarConsultas(page);
  }

  // ===========================================
  // # paginasVisiveis - Retorna páginas para navegação
  // ===========================================
  paginasVisiveis(): number[] {
    const total = this.totalPaginas();
    if (total <= 0) return [];

    const atual = this.paginaAtual();
    const inicio = Math.max(0, atual - 2);
    const fim = Math.min(total - 1, atual + 2);
    const paginas: number[] = [];

    for (let i = inicio; i <= fim; i += 1) {
      paginas.push(i);
    }

    return paginas;
  }

  // ===========================================
  // # verDetalhes - Navega para detalhes da consulta
  // ===========================================
  verDetalhes(id: number): void {
    this.router.navigate(['/consultas', id]);
  }

  // ===========================================
  // # getConsultaPrefix - Gera prefixo tipo SKU para consulta
  // ===========================================
  getConsultaPrefix(id: number): string {
    return `CNS-${id.toString().padStart(4, '0')}`;
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
}