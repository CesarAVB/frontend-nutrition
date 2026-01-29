import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../services/paciente';
import { PacienteDTO } from '../../models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pacientes {
  private service = inject(PacienteService);

  pacientes = signal<PacienteDTO[]>([]);
  busca = signal('');

  pacientesFiltrados = computed(() => {
    const bRaw = this.busca() ?? '';
    const b = String(bRaw).trim().toLowerCase();
    const digitsQuery = b.replace(/\D/g, '');

    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();

    const normQuery = normalize(b);

    const filtered = this.pacientes().filter(p => {
      const nomeRaw = String(p.nomeCompleto ?? '');
      const nome = normalize(nomeRaw);
      const cpfRaw = String(p.cpf ?? '');
      const cpfDigits = cpfRaw.replace(/\D/g, '');

      // match full normalized name
      if (nome.includes(normQuery) && normQuery.length > 0) return true;

      // match any token of the name (first, last, etc.)
      if (normQuery.length > 0) {
        const tokens = nome.split(/\s+/).filter(Boolean);
        for (const t of tokens) {
          if (t.includes(normQuery)) return true;
        }
      }

      // CPF: if query has digits, match digits-only cpf; otherwise match raw cpf string
      const cpfMatch = digitsQuery ? cpfDigits.includes(digitsQuery) : cpfRaw.toLowerCase().includes(b);

      return cpfMatch;
    });

    // Debug logs (temporary) - helpful during UI testing
    try {
      // eslint-disable-next-line no-console
      console.debug('[pacientesFiltrados] query:', { raw: bRaw, normalized: normQuery, digitsQuery, total: this.pacientes().length, filtered: filtered.length });
    } catch (e) {}

    return filtered;
  });

  // ===========================================
  // # constructor - Inicializa o componente
  // ===========================================
  constructor() {
    this.service.listarTodos().subscribe(res => this.pacientes.set(res));
  }

  // ===========================================
  // # getUltimaVisita - Obtém última visita formatada
  // ===========================================
  getUltimaVisita(p: PacienteDTO) {
    const raw = p.ultimaConsulta;
    if (!raw) return '-';

    let d = new Date(raw as any);
    if (isNaN(d.getTime())) {
      const s = String(raw).trim().replace(' ', 'T');
      d = new Date(s);
      if (isNaN(d.getTime())) {
        return '-';
      }
    }

    return d.toLocaleDateString('pt-BR');
  }

  // ===========================================
  // # getConsultasCount - Obtém contagem de consultas
  // ===========================================
  getConsultasCount(p: PacienteDTO) {
    return p.totalConsultas ?? 0;
  }

  // ===========================================
  // # getIniciais - Obtém iniciais do nome
  // ===========================================
  getIniciais(nome: string) {
    const partes = nome.split(' ');
    return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
  }
}