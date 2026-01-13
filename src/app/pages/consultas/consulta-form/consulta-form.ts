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
import { forkJoin } from 'rxjs';
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
  consultaId?: number;

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

    const consultaIdFromRoute = this.route.snapshot.queryParams['consultaId'];
    if (consultaIdFromRoute) {
      this.consultaId = Number(consultaIdFromRoute);
      this.loadFotos(this.consultaId);
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

  // ============================================
  // Upload de Fotos
  // ============================================
  onFileSelected(event: Event, tipoFoto: TipoFoto): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const arquivo = input.files[0];

      if (!arquivo.type.startsWith('image/')) {
        this.toastService.error('Selecione apenas arquivos de imagem');
        return;
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        this.toastService.error('A imagem deve ter no máximo 5MB');
        return;
      }

      this.fotos[tipoFoto].arquivo = arquivo;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotos[tipoFoto].preview = e.target?.result as string;
      };
      reader.readAsDataURL(arquivo);
    }
  }

  removerFoto(tipoFoto: TipoFoto): void {
    this.fotos[tipoFoto] = { arquivo: null, preview: null, uploading: false };
  }

  triggerFileInput(tipoFoto: TipoFoto): void {
    const inputId = `file-${tipoFoto.toLowerCase().replace(/_/g, '-')}`;
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) input.click();
  }

  private uploadFotos(consultaId: number): void {
    const arquivos: Record<TipoFoto, File | null> = {
      ANTERIOR: this.fotos.ANTERIOR.arquivo,
      POSTERIOR: this.fotos.POSTERIOR.arquivo,
      LATERAL_ESQUERDA: this.fotos.LATERAL_ESQUERDA.arquivo,
      LATERAL_DIREITA: this.fotos.LATERAL_DIREITA.arquivo,
    };

    const hasFotos = Object.values(arquivos).some((f) => f !== null);
    if (!hasFotos) return;

    this.consultaService.uploadFotos(consultaId, arquivos).subscribe({
      next: () => this.toastService.success('Fotos enviadas com sucesso!'),
      error: (err) => this.toastService.error('Erro ao enviar fotos'),
    });
  }

  // ============================================
  // Load Fotos Existentes
  // ============================================
  private loadFotos(consultaId: number): void {
    this.consultaService.getFotos(consultaId).subscribe({
      next: (fotos) => {
        (Object.keys(fotos) as TipoFoto[]).forEach((tipo) => {
          this.fotos[tipo].preview = fotos[tipo]; // preview é a URL da foto
        });
      },
      error: (err) => {
        console.error('Erro ao carregar fotos:', err);
      },
    });
  }

  // ============================================
  // Submit Consulta
  // ============================================
  onSubmit(): void {
    console.log('='.repeat(60));
    console.log('🚀 INICIANDO SALVAMENTO DE CONSULTA');
    console.log('='.repeat(60));

    if (!this.estiloVidaForm.valid || !this.medidasForm.valid) {
      console.log('❌ Formulários inválidos:');
      console.log('  - Estilo de Vida válido?', this.estiloVidaForm.valid);
      console.log('  - Medidas válido?', this.medidasForm.valid);
      console.log('  - Erros no Estilo de Vida:', this.estiloVidaForm.errors);
      console.log('  - Erros nas Medidas:', this.medidasForm.errors);

      this.toastService.warning('Preencha todos os campos obrigatórios');
      Object.keys(this.estiloVidaForm.controls).forEach((k) =>
        this.estiloVidaForm.get(k)?.markAsTouched()
      );
      Object.keys(this.medidasForm.controls).forEach((k) =>
        this.medidasForm.get(k)?.markAsTouched()
      );
      return;
    }

    if (!this.pacienteId) {
      console.log('❌ Paciente não identificado');
      this.toastService.error('Paciente não identificado');
      return;
    }

    console.log('✅ Validações OK');
    console.log('📋 Paciente ID:', this.pacienteId);
    console.log('📋 Nome do Paciente:', this.pacienteNome);
    console.log('');

    console.log('📊 DADOS DO QUESTIONÁRIO DE ESTILO DE VIDA:');
    console.log('-'.repeat(60));
    let questionarioData = { ...this.estiloVidaForm.value };
    Object.keys(questionarioData).forEach((key) => {
      console.log(`  ${key}:`, questionarioData[key]);
    });
    console.log('');

    console.log('📏 DADOS DA AVALIAÇÃO FÍSICA:');
    console.log('-'.repeat(60));
    let avaliacaoData = { ...this.medidasForm.value };
    Object.keys(avaliacaoData).forEach((key) => {
      console.log(`  ${key}:`, avaliacaoData[key]);
    });
    console.log('');

    // ✅ CORREÇÕES CRÍTICAS ✅

    // 1️⃣ Remover consultaId (vem na URL, não no body)
    delete questionarioData.consultaId;
    delete avaliacaoData.consultaId;

    // 2️⃣ Remover campo intolerancias (não existe no backend)
    delete questionarioData.intolerancias;

    // 3️⃣ Corrigir ingestaoAguaDiaria (remover letras, converter para número)
    if (questionarioData.ingestaoAguaDiaria) {
      const valor = questionarioData.ingestaoAguaDiaria.toString().replace(/[^0-9.]/g, ''); // Remove tudo que não é número ou ponto

      questionarioData.ingestaoAguaDiaria = valor ? parseFloat(valor) : null;
      console.log('✅ ingestaoAguaDiaria corrigida:', questionarioData.ingestaoAguaDiaria);
    }

    const payload: CriarConsultaDTO = {
      avaliacaoFisica: avaliacaoData,
      questionarioEstiloVida: questionarioData,
    };

    console.log('📦 PAYLOAD CORRIGIDO ENVIADO AO BACKEND:');
    console.log('-'.repeat(60));
    console.log(JSON.stringify(payload, null, 2));
    console.log('');
    console.log('🌐 Endpoint:', `POST /api/v1/consultas/paciente/${this.pacienteId}`);
    console.log('');

    // 1️⃣ Criar consulta
    this.consultaService.criar(this.pacienteId, payload).subscribe({
      next: (consulta) => {
        console.log('✅ RESPOSTA DO BACKEND:');
        console.log('-'.repeat(60));
        console.log('Consulta criada com ID:', consulta.id);
        console.log('');

        this.toastService.success('Consulta salva com sucesso!');

        // 2️⃣ Depois de criar consulta, salvar questionário e avaliação em paralelo
        console.log('💾 Salvando avaliação e questionário em paralelo...');
        console.log('');

        forkJoin([
          this.consultaService.salvarAvaliacao(consulta.id, avaliacaoData),
          this.consultaService.salvarQuestionario(consulta.id, questionarioData),
        ]).subscribe({
          next: (results) => {
            console.log('✅ Avaliação e Questionário salvos com sucesso!');
            console.log('Avaliação:', results[0]);
            console.log('Questionário:', results[1]);
            console.log('');

            // 3️⃣ Upload de fotos
            const fotosParaUpload = Object.values(this.fotos).filter(
              (f) => f.arquivo !== null
            ).length;
            if (fotosParaUpload > 0) {
              console.log(`📸 Iniciando upload de ${fotosParaUpload} foto(s)...`);
              this.uploadFotos(consulta.id);
            } else {
              console.log('✅ Sem fotos para upload');
              this.router.navigate(['/pacientes', this.pacienteId]);
              console.log('='.repeat(60));
            }
          },
          error: (error) => {
            console.error('❌ ERRO AO SALVAR AVALIAÇÃO/QUESTIONÁRIO:');
            console.error('-'.repeat(60));
            console.error('Status:', error.status);
            console.error('Mensagem:', error.message);
            console.error('Erro completo:', error);
            console.error('='.repeat(60));
            this.toastService.error('Erro ao salvar dados adicionais da consulta');
          },
        });
      },
      error: (err) => {
        console.error('❌ ERRO AO SALVAR CONSULTA:');
        console.error('-'.repeat(60));
        console.error('Status:', err.status);
        console.error('Mensagem:', err.message);
        console.error('Erro completo:', err);
        console.error('='.repeat(60));
        this.toastService.error('Erro ao salvar consulta');
      },
    });
  }

  cancelar(): void {
    if (this.pacienteId) this.router.navigate(['/pacientes', this.pacienteId]);
    else this.location.back();
  }

  // Adicione dentro da classe ConsultaFormComponent
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    if (!field || !field.errors) return null;

    if (field.errors['required']) return 'Campo obrigatório';
    if (field.errors['minlength'])
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['maxlength'])
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }
}
