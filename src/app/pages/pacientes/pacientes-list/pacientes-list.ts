import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../../../services/paciente';
import { PacienteDTO } from '../../../models/paciente.model';
import { ToastService } from '../../../services/toast';

interface PacienteView extends PacienteDTO {
  iniciais: string;
  ultimaVisita: string;
}

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-list.html',
  styleUrls: ['./pacientes-list.scss']
})
export class PacientesListComponent implements OnInit, OnDestroy {
  searchTerm = signal('');
  pacientes = signal<PacienteView[]>([]);
  isLoading = signal(false);
  error = signal('');
  paginaAtual = signal(0);
  tamanhoPagina = signal(10);
  totalPaginas = signal(0);
  totalItens = signal(0);
  private debounceHandle: ReturnType<typeof setTimeout> | null = null;

  pacientesFiltrados = computed(() => {
    const raw = this.searchTerm() ?? '';
    const termo = String(raw).trim().toLowerCase();
    const digitsQuery = termo.replace(/\D/g, '');
    const lista = this.pacientes();

    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    const normQuery = normalize(termo);

    if (!termo) return lista;

    const filtered = lista.filter(p => {
      const nome = normalize(p.nomeCompleto ?? '');
      const cpfDigits = String(p.cpf ?? '').replace(/\D/g, '');

      // name full match or token match
      if (normQuery.length > 0 && nome.includes(normQuery)) return true;
      if (normQuery.length > 0) {
        const tokens = nome.split(/\s+/).filter(Boolean);
        for (const t of tokens) if (t.includes(normQuery)) return true;
      }

      // cpf match
      if (digitsQuery) return cpfDigits.includes(digitsQuery);
      return String(p.cpf ?? '').toLowerCase().includes(termo);
    });

    return filtered;
  });

  // ===========================================
  // # constructor - Inicializa o componente
  // ===========================================
  constructor(
    private pacienteService: PacienteService,
    private router: Router
  ) {}

  private toastService = inject(ToastService);

  // ===========================================
  // # ngOnInit - Inicializa o componente
  // ===========================================
  ngOnInit(): void {
    this.carregarPacientes(0);
  }

  ngOnDestroy(): void {
    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
      this.debounceHandle = null;
    }
  }

  // ===========================================
  // # carregarPacientes - Carrega lista de pacientes
  // ===========================================
  carregarPacientes(page = this.paginaAtual()): void {
    this.isLoading.set(true);
    this.error.set('');

    const termo = this.searchTerm().trim();
    const usarBuscaPorNome = termo.length >= 3;
    const sort = usarBuscaPorNome ? 'nomeCompleto' : 'id';
    const direction = usarBuscaPorNome ? 'asc' : 'desc';

    const request$ = usarBuscaPorNome
      ? this.pacienteService.buscarPorNomePaginado(termo, page, this.tamanhoPagina(), sort, direction)
      : this.pacienteService.listarPaginado(page, this.tamanhoPagina(), sort, direction);

    request$.subscribe({
      next: (resposta) => {
        const pacientesView = resposta.content.map((p) => this.mapearParaView(p));
        this.pacientes.set(pacientesView);
        this.paginaAtual.set(resposta.number);
        this.totalPaginas.set(resposta.totalPages);
        this.totalItens.set(resposta.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar pacientes. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  // ===========================================
  // # onSearchTermChange - Atualiza busca e reinicia paginação
  // ===========================================
  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);

    if (this.debounceHandle) {
      clearTimeout(this.debounceHandle);
    }

    this.debounceHandle = setTimeout(() => {
      this.carregarPacientes(0);
    }, 350);
  }

  // ===========================================
  // # paginaAnterior - Navega para a página anterior
  // ===========================================
  paginaAnterior(): void {
    if (this.paginaAtual() <= 0 || this.isLoading()) return;
    this.carregarPacientes(this.paginaAtual() - 1);
  }

  // ===========================================
  // # proximaPagina - Navega para a próxima página
  // ===========================================
  proximaPagina(): void {
    if (this.paginaAtual() >= this.totalPaginas() - 1 || this.isLoading()) return;
    this.carregarPacientes(this.paginaAtual() + 1);
  }

  // ===========================================
  // # irParaPagina - Navega para página específica
  // ===========================================
  irParaPagina(page: number): void {
    if (page < 0 || page >= this.totalPaginas() || page === this.paginaAtual() || this.isLoading()) return;
    this.carregarPacientes(page);
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
  // # novoPaciente - Navega para criação de novo paciente
  // ===========================================
  novoPaciente(): void {
    this.router.navigate(['/pacientes/novo']);
  }

  // ===========================================
  // # abrirWhatsApp - Abre WhatsApp do paciente
  // ===========================================
  abrirWhatsApp(telefone: string): void {
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  }

  // ===========================================
  // # verDetalhes - Navega para detalhes do paciente
  // ===========================================
  verDetalhes(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }

  // ===========================================
  // # mapearParaView - Mapeia paciente para view
  // ===========================================
  private mapearParaView(paciente: PacienteDTO): PacienteView {
    return {
      ...paciente,
      iniciais: this.getIniciais(paciente.nomeCompleto),
      ultimaVisita: this.formatarData(paciente.ultimaConsulta)
    };
  }

  // ===========================================
  // # getIniciais - Obtém iniciais do nome
  // ===========================================
  private getIniciais(nome: string): string {
    const partes = nome.split(' ').filter(p => p.length > 0);
    if (partes.length === 0) return 'NN';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  // ===========================================
  // # formatarData - Formata data para exibição
  // ===========================================
  private formatarData(dataISO?: string): string {
    if (!dataISO) return '-';

    let d = new Date(dataISO as any);
    if (isNaN(d.getTime())) {
      const s = String(dataISO).trim().replace(' ', 'T');
      d = new Date(s);
      if (isNaN(d.getTime())) return '-';
    }

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}