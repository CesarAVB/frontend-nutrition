import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
export class PacientesListComponent implements OnInit {
  searchTerm = signal('');
  pacientes = signal<PacienteView[]>([]);
  isLoading = signal(false);
  error = signal('');

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

    try {
      // eslint-disable-next-line no-console
      console.debug('[PacientesList] search', { raw, termo, normQuery, countAll: lista.length, countFiltered: filtered.length });
    } catch (e) {}

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
    this.carregarPacientes();
  }

  // ===========================================
  // # carregarPacientes - Carrega lista de pacientes
  // ===========================================
  carregarPacientes(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.pacienteService.listarTodos().subscribe({
      next: (pacientes) => {
        const pacientesView = pacientes.map(p => this.mapearParaView(p));
        this.pacientes.set(pacientesView);
        this.isLoading.set(false);
      },
      error: (erro) => {
        this.toastService.error('Erro ao carregar pacientes. Tente novamente.');
        this.isLoading.set(false);
      }
    });
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