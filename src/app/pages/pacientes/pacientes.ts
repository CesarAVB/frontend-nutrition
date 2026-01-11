import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../services/paciente';
import { Paciente } from '../../models/paciente.model';

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

  pacientes = signal<Paciente[]>([]);
  busca = signal('');

  pacientesFiltrados = computed(() => {
    const b = this.busca().toLowerCase();
    return this.pacientes().filter(p =>
      p.nomeCompleto.toLowerCase().includes(b) ||
      p.cpf.includes(b)
    );
  });

  constructor() {
    this.service.getAll().subscribe(res => this.pacientes.set(res));
  }

  getUltimaVisita(p: Paciente) {
    if (!p.consultas || p.consultas.length === 0) return '-';
    const sorted = [...p.consultas].sort(
      (a, b) => new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime()
    );
    return new Date(sorted[0].dataConsulta).toLocaleDateString('pt-BR');
  }

  getConsultasCount(p: Paciente) {
    return p.consultas?.length ?? 0;
  }

  getIniciais(nome: string) {
    const partes = nome.split(' ');
    return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
  }
}
