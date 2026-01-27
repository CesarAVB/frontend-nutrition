import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/paciente';
import { PacienteDTO } from '../../models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pacientes {
  private service = inject(PacienteService);

  pacientes = signal<PacienteDTO[]>([]);
  busca = signal('');

  pacientesFiltrados = computed(() => {
    const b = this.busca().toLowerCase();
    return this.pacientes().filter(p =>
      p.nomeCompleto.toLowerCase().includes(b) ||
      p.cpf.includes(b)
    );
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