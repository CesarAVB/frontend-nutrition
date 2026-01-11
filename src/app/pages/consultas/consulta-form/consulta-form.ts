import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

type TabType = 'estilo-vida' | 'medidas' | 'fotos' | 'dieta';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-form.html',
  styleUrls: ['./consulta-form.scss']
})
export class ConsultaFormComponent implements OnInit {
  activeTab: TabType = 'estilo-vida';
  pacienteId?: number;
  pacienteNome = 'Maria Silva Santos';

  estiloVidaForm: FormGroup;
  medidasForm: FormGroup;

  objetivos = ['Emagrecimento', 'Ganho de massa muscular', 'Manutenção', 'Performance esportiva'];
  frequenciasTreino = ['Não treina', '1-2x por semana', '3-4x por semana', '5-6x por semana', 'Todos os dias'];
  consumoAlcool = ['Não consome', 'Raramente', '1-2x por semana', '3-4x por semana', 'Diariamente'];
  funcionamentoIntestino = ['Regular', 'Irregular', 'Constipação', 'Diarreia'];
  usoAnabolizantes = ['Não utiliza', 'Utiliza atualmente', 'Já utilizou'];
  numeroRefeicoes = [3, 4, 5, 6];
  horariosFome = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.estiloVidaForm = this.fb.group({
      objetivo: ['', Validators.required],
      frequenciaTreino: ['', Validators.required],
      tempoTreino: [''],
      cirurgias: [''],
      doencas: [''],
      historicoFamiliar: [''],
      medicamentos: [''],
      suplementos: [''],
      usoAnabolizantes: ['', Validators.required],
      fuma: [false],
      frequenciaAlcool: ['', Validators.required],
      funcionamentoIntestino: ['', Validators.required],
      qualidadeSono: [''],
      ingestaoAguaDiaria: [''],
      alimentosNaoGosta: [''],
      frutasPreferidas: [''],
      numeroRefeicoesDesejadas: ['', Validators.required],
      horarioMaiorFome: ['', Validators.required],
      pressaoArterial: [''],
      intolerancias: ['']
    });

    this.medidasForm = this.fb.group({
      // Perímetros
      perimetroOmbro: [''],
      perimetroTorax: [''],
      perimetroCintura: [''],
      perimetroAbdominal: [''],
      perimetroQuadril: [''],
      perimetroBracoDireitoRelax: [''],
      perimetroBracoDireitoContr: [''],
      perimetroBracoEsquerdoRelax: [''],
      perimetroBracoEsquerdoContr: [''],
      perimetroAntebracoDireito: [''],
      perimetroAntebracoEsquerdo: [''],
      perimetroCoxaDireita: [''],
      perimetroCoxaEsquerda: [''],
      perimetroPanturrilhaDireita: [''],
      perimetroPanturrilhaEsquerda: [''],
      // Dobras
      dobraTriceps: [''],
      dobraPeito: [''],
      dobraAxilarMedia: [''],
      dobraSubescapular: [''],
      dobraAbdominal: [''],
      dobraSupraIliaca: [''],
      dobraCoxa: [''],
      // Composição
      pesoAtual: ['', Validators.required],
      massaMagra: [''],
      massaGorda: [''],
      percentualGordura: [''],
      imc: ['']
    });
  }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.params['id'];
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  onSubmit(): void {
    if (this.estiloVidaForm.valid && this.medidasForm.valid) {
      const consultaData = {
        estiloVida: this.estiloVidaForm.value,
        medidas: this.medidasForm.value
      };
      
      console.log('Dados da consulta:', consultaData);
      
      // Aqui você faria a chamada para o backend
      alert('Consulta salva com sucesso!');
      this.router.navigate(['/pacientes', this.pacienteId]);
    } else {
      alert('Por favor, preencha todos os campos obrigatórios');
    }
  }

  cancelar(): void {
    this.router.navigate(['/pacientes', this.pacienteId]);
  }
}