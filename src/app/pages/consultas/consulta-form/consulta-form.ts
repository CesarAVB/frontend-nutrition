// src/app/pages/consultas/consulta-form/consulta-form.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PacienteService } from '../../../services/paciente';
import { ToastService } from '../../../services/toast';
import { ConsultaService } from '../../../services/consulta';
import { CriarConsultaDTO } from '../../../models/consulta-create.model';
import { forkJoin, of } from 'rxjs';
import { TipoFoto } from '../../../models/tipo-foto';

type TabType = 'estilo-vida' | 'medidas' | 'fotos' | 'dieta';

interface FotoInfo {
  arquivo: File | null;
  preview: string | null;
  uploading: boolean;
}

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-form.html',
  styleUrls: ['./consulta-form.scss'],
})
export class ConsultaFormComponent implements OnInit {
  activeTab: TabType = 'estilo-vida';
  pacienteId?: number;
  pacienteNome = 'Selecione um paciente';

  estiloVidaForm: FormGroup;
  medidasForm: FormGroup;

  // Propriedades para gerenciar fotos
  fotos: Record<TipoFoto, FotoInfo> = {
    ANTERIOR: { arquivo: null, preview: null, uploading: false },
    POSTERIOR: { arquivo: null, preview: null, uploading: false },
    LATERAL_ESQUERDA: { arquivo: null, preview: null, uploading: false },
    LATERAL_DIREITA: { arquivo: null, preview: null, uploading: false },
  };

  objetivos = ['Emagrecimento', 'Ganho de massa muscular', 'Manutenção', 'Performance esportiva'];
  frequenciasTreino = [
    'Não treina',
    '1-2x por semana',
    '3-4x por semana',
    '5-6x por semana',
    'Todos os dias',
  ];
  consumoAlcool = ['Não consome', 'Raramente', '1-2x por semana', '3-4x por semana', 'Diariamente'];
  funcionamentoIntestino = ['Regular', 'Irregular', 'Constipação', 'Diarreia'];
  usoAnabolizantes = ['Não utiliza', 'Utiliza atualmente', 'Já utilizou'];
  numeroRefeicoes = [3, 4, 5, 6];
  horariosFome = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];

  constructor(
    private consultaService: ConsultaService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private pacienteService: PacienteService
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
      intolerancias: [''],
    });

    this.medidasForm = this.fb.group({
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
      dobraTriceps: [''],
      dobraPeito: [''],
      dobraAxilarMedia: [''],
      dobraSubescapular: [''],
      dobraAbdominal: [''],
      dobraSupraIliaca: [''],
      dobraCoxa: [''],
      pesoAtual: ['', Validators.required],
      massaMagra: [''],
      massaGorda: [''],
      percentualGordura: [''],
      imc: [''],
    });
  }

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.params['id'];
    if (idFromRoute) {
      this.pacienteId = Number(idFromRoute);
      this.carregarNomePaciente(this.pacienteId);
    }
  }

  carregarNomePaciente(id: number): void {
    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        this.pacienteNome = paciente.nomeCompleto;
      },
      error: (erro) => {
        console.error('Erro ao carregar nome do paciente:', erro);
        this.pacienteNome = `Paciente ${id}`;
      },
    });
  }

  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  onSubmit(): void {
    console.log('onSubmit chamado!');
    console.log('Estilo de vida válido?', this.estiloVidaForm.valid);
    console.log('Valores do formulário estilo de vida:', this.estiloVidaForm.value);
    console.log('Medidas válido?', this.medidasForm.valid);
    console.log('Valores do formulário medidas:', this.medidasForm.value);

    if (this.estiloVidaForm.valid && this.medidasForm.valid) {
      if (!this.pacienteId) {
        this.toastService.error('Paciente não identificado');
        return;
      }

      const payload: CriarConsultaDTO = {
        avaliacaoFisica: this.medidasForm.value,
        questionarioEstiloVida: this.estiloVidaForm.value,
      };

      this.consultaService.criar(this.pacienteId!, payload).subscribe({
        next: (consulta) => {
          this.toastService.success('Consulta salva com sucesso!');

          // Fazer upload das fotos se houver alguma selecionada
          this.uploadFotos(consulta.id);
        },
        error: (error) => {
          console.error('Erro ao salvar consulta:', error);
          this.toastService.error('Erro ao salvar a consulta');
        },
      });
    } else {
      console.log('Formulários inválidos');

      // Marcar campos como tocados para exibir erros
      Object.keys(this.estiloVidaForm.controls).forEach((key) => {
        const control = this.estiloVidaForm.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido no estilo de vida: ${key}`, control.errors);
          control.markAsTouched();
        }
      });

      Object.keys(this.medidasForm.controls).forEach((key) => {
        const control = this.medidasForm.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido nas medidas: ${key}`, control.errors);
          control.markAsTouched();
        }
      });

      this.toastService.warning('Por favor, preencha todos os campos obrigatórios');
    }
  }

  cancelar(): void {
    if (this.pacienteId) {
      this.router.navigate(['/pacientes', this.pacienteId]);
    } else {
      this.location.back();
    }
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
    }
    return '';
  }

  // ============================================
  // Métodos para Upload de Fotos
  // ============================================

  onFileSelected(event: Event, tipoFoto: TipoFoto): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const arquivo = input.files[0];

      // Validar tipo de arquivo
      if (!arquivo.type.startsWith('image/')) {
        this.toastService.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      // Validar tamanho (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (arquivo.size > maxSize) {
        this.toastService.error('A imagem deve ter no máximo 5MB');
        return;
      }

      // Armazenar arquivo
      this.fotos[tipoFoto].arquivo = arquivo;

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotos[tipoFoto].preview = e.target?.result as string;
      };
      reader.readAsDataURL(arquivo);
    }
  }

  removerFoto(tipoFoto: TipoFoto): void {
    this.fotos[tipoFoto] = {
      arquivo: null,
      preview: null,
      uploading: false,
    };
  }

  triggerFileInput(tipoFoto: TipoFoto): void {
    const inputId = `file-${tipoFoto.toLowerCase().replace(/_/g, '-')}`;
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  private uploadFotos(consultaId: number): void {
    // Extrair apenas os arquivos do Record
    const arquivos: Record<TipoFoto, File | null> = {
      ANTERIOR: this.fotos.ANTERIOR.arquivo,
      POSTERIOR: this.fotos.POSTERIOR.arquivo,
      LATERAL_ESQUERDA: this.fotos.LATERAL_ESQUERDA.arquivo,
      LATERAL_DIREITA: this.fotos.LATERAL_DIREITA.arquivo,
    };

    const hasFotos = Object.values(arquivos).some((file) => file !== null);
    if (!hasFotos) {
      this.router.navigate(['/pacientes', this.pacienteId]);
      return;
    }

    this.consultaService.uploadFotos(consultaId, arquivos).subscribe({
      next: () => {
        this.toastService.success('Fotos enviadas com sucesso!');
        this.router.navigate(['/pacientes', this.pacienteId]);
      },
      error: (error) => {
        console.error('Erro ao enviar fotos:', error);
        this.toastService.error('Erro ao enviar algumas fotos');
      },
    });
  }
}
