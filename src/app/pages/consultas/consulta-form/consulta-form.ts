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
import { ConsultaDetalhadaDTO } from '../../../models/paciente.model';
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
  pacienteUltimaVisita: string = '-';
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

  // Rastrear fotos removidas
  fotosRemovidas: Record<TipoFoto, boolean> = {
    ANTERIOR: false,
    POSTERIOR: false,
    LATERAL_ESQUERDA: false,
    LATERAL_DIREITA: false,
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
      altura: [''],
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

  // ===========================================
  // # ngOnInit - Inicializa o componente e carrega dados iniciais
  // ===========================================
  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.params['id'];
    if (idFromRoute) {
      this.pacienteId = Number(idFromRoute);
      this.carregarNomePaciente(this.pacienteId);
    }

    const consultaIdFromRoute = this.route.snapshot.queryParams['consultaId'];
    if (consultaIdFromRoute) {
      this.consultaId = Number(consultaIdFromRoute);
      this.carregarConsulta(this.consultaId);
    }

    // Calcular IMC automaticamente ao alterar altura ou peso
    this.medidasForm.valueChanges.subscribe((vals) => {
      const peso = vals.pesoAtual;
      const altura = vals.altura;

      if (peso && altura) {
        // altura no formulário está em cm; converter para metros
        const alturaM = parseFloat(altura) / 100;
        const p = parseFloat(peso);
        if (!isNaN(p) && !isNaN(alturaM) && alturaM > 0) {
          const imc = p / (alturaM * alturaM);
          const imcFix = Number(imc.toFixed(1));
          this.medidasForm.get('imc')?.setValue(imcFix, { emitEvent: false });
        } else {
          this.medidasForm.get('imc')?.setValue('', { emitEvent: false });
        }
      } else {
        this.medidasForm.get('imc')?.setValue('', { emitEvent: false });
      }
    });
  }

  // ===========================================
  // # carregarConsulta - Carrega dados completos de uma consulta existente
  // ===========================================
  carregarConsulta(consultaId: number): void {
    this.consultaService.buscarCompleta(consultaId).subscribe({
      next: (consulta: ConsultaDetalhadaDTO) => {
        // Preencher formulário de estilo de vida
        if (consulta.questionario) {
          this.estiloVidaForm.patchValue({
            objetivo: consulta.questionario.objetivo || '',
            frequenciaTreino: consulta.questionario.frequenciaTreino || '',
            tempoTreino: consulta.questionario.tempoTreino || '',
            cirurgias: consulta.questionario.cirurgias || '',
            doencas: consulta.questionario.doencas || '',
            historicoFamiliar: consulta.questionario.historicoFamiliar || '',
            medicamentos: consulta.questionario.medicamentos || '',
            suplementos: consulta.questionario.suplementos || '',
            usoAnabolizantes: consulta.questionario.usoAnabolizantes || '',
            fuma: consulta.questionario.fuma || false,
            frequenciaAlcool: consulta.questionario.frequenciaAlcool || '',
            funcionamentoIntestino: consulta.questionario.funcionamentoIntestino || '',
            qualidadeSono: consulta.questionario.qualidadeSono || '',
            ingestaoAguaDiaria: consulta.questionario.ingestaoAguaDiaria || '',
            alimentosNaoGosta: consulta.questionario.alimentosNaoGosta || '',
            frutasPreferidas: consulta.questionario.frutasPreferidas || '',
            numeroRefeicoesDesejadas: consulta.questionario.numeroRefeicoesDesejadas || '',
            horarioMaiorFome: consulta.questionario.horarioMaiorFome || '',
            pressaoArterial: consulta.questionario.pressaoArterial || '',
            intolerancias: consulta.questionario.intolerancias || '',
          });
        }

        // Preencher formulário de medidas
        if (consulta.avaliacaoFisica) {
          this.medidasForm.patchValue({
            altura: consulta.avaliacaoFisica.altura || '',
            perimetroOmbro: consulta.avaliacaoFisica.perimetroOmbro || '',
            perimetroTorax: consulta.avaliacaoFisica.perimetroTorax || '',
            perimetroCintura: consulta.avaliacaoFisica.perimetroCintura || '',
            perimetroAbdominal: consulta.avaliacaoFisica.perimetroAbdominal || '',
            perimetroQuadril: consulta.avaliacaoFisica.perimetroQuadril || '',
            perimetroBracoDireitoRelax: consulta.avaliacaoFisica.perimetroBracoDireitoRelax || '',
            perimetroBracoDireitoContr: consulta.avaliacaoFisica.perimetroBracoDireitoContr || '',
            perimetroBracoEsquerdoRelax: consulta.avaliacaoFisica.perimetroBracoEsquerdoRelax || '',
            perimetroBracoEsquerdoContr: consulta.avaliacaoFisica.perimetroBracoEsquerdoContr || '',
            perimetroCoxaDireita: consulta.avaliacaoFisica.perimetroCoxaDireita || '',
            perimetroCoxaEsquerda: consulta.avaliacaoFisica.perimetroCoxaEsquerda || '',
            perimetroPanturrilhaDireita: consulta.avaliacaoFisica.perimetroPanturrilhaDireita || '',
            perimetroPanturrilhaEsquerda: consulta.avaliacaoFisica.perimetroPanturrilhaEsquerda || '',
            perimetroAntebracoDireito: consulta.avaliacaoFisica.perimetroAntebracoDireito || '',
            perimetroAntebracoEsquerdo: consulta.avaliacaoFisica.perimetroAntebracoEsquerdo || '',
            dobraTriceps: consulta.avaliacaoFisica.dobraTriceps || '',
            dobraPeito: consulta.avaliacaoFisica.dobraPeito || '',
            dobraAxilarMedia: consulta.avaliacaoFisica.dobraAxilarMedia || '',
            dobraSubescapular: consulta.avaliacaoFisica.dobraSubescapular || '',
            dobraAbdominal: consulta.avaliacaoFisica.dobraAbdominal || '',
            dobraSupraIliaca: consulta.avaliacaoFisica.dobraSupraIliaca || '',
            dobraCoxa: consulta.avaliacaoFisica.dobraCoxa || '',
            pesoAtual: consulta.avaliacaoFisica.pesoAtual || '',
            massaMagra: consulta.avaliacaoFisica.massaMagra || '',
            massaGorda: consulta.avaliacaoFisica.massaGorda || '',
            percentualGordura: consulta.avaliacaoFisica.percentualGordura || '',
            imc: consulta.avaliacaoFisica.imc || '',
          });
        }

        // Carregar fotos se houver
        if (consulta.registroFotografico) {
          this.loadFotos(consultaId);
        }
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar dados da consulta');
      }
    });
  }

  // ===========================================
  // # carregarNomePaciente - Carrega nome e última visita do paciente
  // ===========================================
  carregarNomePaciente(id: number): void {
    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        this.pacienteNome = paciente.nomeCompleto;
        // Formatar última visita se disponível
        if (paciente.ultimaConsulta) {
          try {
            const d = new Date(paciente.ultimaConsulta);
            if (!isNaN(d.getTime())) {
              this.pacienteUltimaVisita = d.toLocaleDateString('pt-BR');
            } else {
              this.pacienteUltimaVisita = '-';
            }
          } catch {
            this.pacienteUltimaVisita = '-';
          }
        } else {
          this.pacienteUltimaVisita = '-';
        }
      },
      error: (erro) => {
        this.pacienteNome = `Paciente ${id}`;
      },
    });
  }

  // ===========================================
  // # setActiveTab - Define a aba ativa do formulário
  // ===========================================
  setActiveTab(tab: TabType): void {
    this.activeTab = tab;
  }

  // ===========================================
  // # onFileSelected - Processa seleção de arquivo de imagem
  // ===========================================
  onFileSelected(event: Event, tipoFoto: TipoFoto): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const arquivo = input.files[0];

    // Validar tipo
    if (!arquivo.type.startsWith('image/')) {
      this.toastService.error('Selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (arquivo.size > maxSize) {
      this.toastService.error('A imagem deve ter no máximo 10MB');
      return;
    }

    // Opcional: Comprimir imagem antes de enviar
    this.comprimirImagem(arquivo).then(comprimida => {
      this.fotos[tipoFoto].arquivo = comprimida;
      this.fotosRemovidas[tipoFoto] = false;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.fotos[tipoFoto].preview = e.target?.result as string;
      };
      reader.readAsDataURL(comprimida);
    });
  }
}

  // ===========================================
  // # comprimirImagem - Comprime imagem mantendo proporção
  // ===========================================
  private comprimirImagem(arquivo: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Redimensionar mantendo proporção (máximo 1920px de largura)
        const maxWidth = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const comprimida = new File([blob], arquivo.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(comprimida);
          } else {
            resolve(arquivo); // Retorna original se falhar
          }
        }, 'image/jpeg', 0.85); // 85% de qualidade
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(arquivo);
  });
}

  // ===========================================
  // # removerFoto - Remove foto selecionada e marca como removida
  // ===========================================
  removerFoto(tipoFoto: TipoFoto): void {
    this.fotos[tipoFoto] = { arquivo: null, preview: null, uploading: false };
    this.fotosRemovidas[tipoFoto] = true; // Marcar como removida
  }

  // ===========================================
  // # triggerFileInput - Aciona seletor de arquivo para tipo específico
  // ===========================================
  triggerFileInput(tipoFoto: TipoFoto): void {
    const inputId = `file-${tipoFoto.toLowerCase().replace(/_/g, '-')}`;
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) input.click();
  }

  // ===========================================
  // # uploadFotos - Faz upload das fotos para o servidor
  // ===========================================
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
      next: () => {
        this.toastService.success('Fotos enviadas com sucesso!');
        this.router.navigate(['/pacientes', this.pacienteId]);
      },
      error: (err) => {
        this.toastService.error('Erro ao enviar fotos');
        // Mesmo com erro no upload de fotos, redirecionar para a página do paciente
        this.router.navigate(['/pacientes', this.pacienteId]);
      },
    });
  }

  // ===========================================
  // # loadFotos - Carrega fotos existentes da consulta
  // ===========================================
  private loadFotos(consultaId: number): void {
    this.consultaService.getFotos(consultaId).subscribe({
      next: (fotos) => {
        (Object.keys(fotos) as TipoFoto[]).forEach((tipo) => {
          this.fotos[tipo].preview = fotos[tipo]; // preview é a URL da foto
        });
      },
      error: (err) => {
        // Silenciosamente ignorar erros de carregamento de fotos
      },
    });
  }

  // ===========================================
  // # onSubmit - Processa envio do formulário de consulta
  // ===========================================
  onSubmit(): void {
    if (!this.estiloVidaForm.valid || !this.medidasForm.valid) {
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
      this.toastService.error('Paciente não identificado');
      return;
    }

    let questionarioData = { ...this.estiloVidaForm.value };
    let avaliacaoData = { ...this.medidasForm.value };

    // Remover consultaId (vem na URL, não no body)
    delete questionarioData.consultaId;
    delete avaliacaoData.consultaId;

    // Não remover campo intolerancias — backend aceita esse campo

    // Corrigir ingestaoAguaDiaria (remover letras, converter para número)
    if (questionarioData.ingestaoAguaDiaria) {
      const valor = questionarioData.ingestaoAguaDiaria.toString().replace(/[^0-9.]/g, '');
      questionarioData.ingestaoAguaDiaria = valor ? parseFloat(valor) : null;
    }

    const payload: CriarConsultaDTO = {
      avaliacaoFisica: avaliacaoData,
      questionarioEstiloVida: questionarioData,
    };
    
    // Verificar se é edição ou criação
    const isEdicao = !!this.consultaId;

    if (isEdicao) {
      // MODO EDIÇÃO: Chamar os 3 endpoints PUT em paralelo
      forkJoin([
        this.consultaService.atualizar(this.consultaId!, payload),
        this.consultaService.atualizarQuestionario(this.consultaId!, questionarioData),
        this.consultaService.atualizarAvaliacao(this.consultaId!, avaliacaoData),
      ]).subscribe({
        next: () => {
          // Verificar se há fotos para atualizar ou remover
          const arquivosFotos: Record<TipoFoto, File | null> = {
            ANTERIOR: this.fotos.ANTERIOR.arquivo,
            POSTERIOR: this.fotos.POSTERIOR.arquivo,
            LATERAL_ESQUERDA: this.fotos.LATERAL_ESQUERDA.arquivo,
            LATERAL_DIREITA: this.fotos.LATERAL_DIREITA.arquivo,
          };
          
          // Verificar se há fotos novas OU removidas
          const hasFotosNovas = Object.values(arquivosFotos).some((f) => f !== null);
          const hasFotosRemovidas = Object.values(this.fotosRemovidas).some((r) => r === true);
          
          if (hasFotosNovas || hasFotosRemovidas) {
            // ✅ PASSAR AS REMOÇÕES TAMBÉM
            this.consultaService.atualizarFotos(
              this.consultaId!, 
              arquivosFotos,
              this.fotosRemovidas
            ).subscribe({
              next: () => {
                this.toastService.success('Consulta atualizada com sucesso!');
                // Limpar o estado de remoções após sucesso
                this.fotosRemovidas = {
                  ANTERIOR: false,
                  POSTERIOR: false,
                  LATERAL_ESQUERDA: false,
                  LATERAL_DIREITA: false,
                };
                this.router.navigate(['/consultas', this.consultaId]);
              },
              error: (err) => {
                this.toastService.warning('Consulta atualizada, mas houve erro ao atualizar fotos');
                this.router.navigate(['/consultas', this.consultaId]);
              },
            });
          } else {
            this.toastService.success('Consulta atualizada com sucesso!');
            this.router.navigate(['/consultas', this.consultaId]);
          }
        },
        error: (err) => {
          this.toastService.error('Erro ao atualizar consulta');
        },
      });
    } else {
      // MODO CRIAÇÃO: Fluxo original
      this.consultaService.criar(this.pacienteId!, payload).subscribe({
        next: (consulta) => {
          this.toastService.success('Consulta salva com sucesso!');

          // Salvar questionário e avaliação em paralelo
          forkJoin([
            this.consultaService.salvarAvaliacao(consulta.id, avaliacaoData),
            this.consultaService.salvarQuestionario(consulta.id, questionarioData),
          ]).subscribe({
            next: () => {
              // Upload de fotos
              const fotosParaUpload = Object.values(this.fotos).filter(
                (f) => f.arquivo !== null
              ).length;
              if (fotosParaUpload > 0) {
                this.uploadFotos(consulta.id);
              } else {
                this.router.navigate(['/consultas', consulta.id]);
              }
            },
            error: (error) => {
              this.toastService.error('Erro ao salvar dados adicionais da consulta');
            },
          });
        },
        error: (err) => {
          this.toastService.error('Erro ao salvar consulta');
        },
      });
    }
  }

  // ===========================================
  // # cancelar - Cancela operação e volta à página anterior
  // ===========================================
  cancelar(): void {
    if (this.pacienteId) this.router.navigate(['/pacientes', this.pacienteId]);
    else this.location.back();
  }

  // ===========================================
  // # isFieldInvalid - Verifica se campo do formulário é inválido
  // ===========================================
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  // ===========================================
  // # getFieldError - Retorna mensagem de erro do campo do formulário
  // ===========================================
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