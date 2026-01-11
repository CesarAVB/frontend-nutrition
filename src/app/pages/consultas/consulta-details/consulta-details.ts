import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultaService } from '../../../services/consulta';
import { ConsultaDetalhadaDTO } from '../../../models/consulta.model';

@Component({
  selector: 'app-consulta-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consulta-details.html',
  styleUrls: ['./consulta-details.scss']
})
export class ConsultaDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);

  consulta = signal<ConsultaDetalhadaDTO | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.carregarConsulta(id);
    }
  }

  carregarConsulta(id: number): void {
    this.isLoading.set(true);
    this.consultaService.buscarCompleta(id).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar consulta:', err);
        this.error.set('Erro ao carregar dados da consulta');
        this.isLoading.set(false);
      }
    });
  }

  voltar(): void {
    const pacienteId = this.consulta()?.pacienteId;
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId]);
    } else {
      this.router.navigate(['/pacientes']);
    }
  }

  formatarData(dataISO: string): string {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}