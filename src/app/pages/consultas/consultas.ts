import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ConsultaService } from '../../services/consulta';
import { ConsultaDetalhadaDTO } from '../../models/consulta.model';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-consultas',
  imports: [CommonModule],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class Consultas implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private consultaService = inject(ConsultaService);
  private toastService = inject(ToastService);

  consulta = signal<ConsultaDetalhadaDTO | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // ===========================================
  // # ngOnInit - Inicializa o componente
  // ===========================================
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.carregarConsulta(+id);
    }
  }

  // ===========================================
  // # carregarConsulta - Carrega dados da consulta
  // ===========================================
  carregarConsulta(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.consultaService.buscarCompleta(id).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar dados da consulta.');
        this.isLoading.set(false);
        this.voltar();
      }
    });
  }

  // ===========================================
  // # voltar - Navega de volta
  // ===========================================
  voltar(): void {
    const pacienteId = this.consulta()?.pacienteId;
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId]);
    } else {
      this.router.navigate(['/pacientes']);
    }
  }
}
