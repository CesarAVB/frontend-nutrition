import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PacienteService } from '../../../services/paciente';
import { PacienteDTO } from '../../../models/paciente.model';
import { ToastService } from '../../../services/toast';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-form.html',
  styleUrls: ['./paciente-form.scss']
})
export class PacienteFormComponent implements OnInit {
  pacienteForm: FormGroup;
  isEditMode = false;
  pacienteId?: number;
  isLoading = false;
  isSaving = false;
  
  private toastService = inject(ToastService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private pacienteService: PacienteService
  ) {
    this.pacienteForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      dataNascimento: ['', [Validators.required, this.validarData]],
      sexo: ['', Validators.required],
      telefoneWhatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      email: ['', [Validators.email]],
      prontuario: ['']
    });
  }

  private validarData(control: AbstractControl): ValidationErrors | null {
    if (!control.touched) return null;

    if (!control.value) return null;

    const valor = control.value;

    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(valor)) {
      return { formatoInvalido: true };
    }

    const partes = valor.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);

    if (mes < 1 || mes > 12) {
      return { dataInvalida: true };
    }

    const diasNoMes = new Date(ano, mes, 0).getDate();
    if (dia < 1 || dia > diasNoMes) {
      return { dataInvalida: true };
    }

    return null;
  }

  ngOnInit(): void {
    if (this.route.snapshot.url.some(segment => segment.path === 'editar')) {
      this.pacienteId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.pacienteId) {
        this.isEditMode = true;
        this.carregarPaciente(this.pacienteId);
      }
    }
  }

  carregarPaciente(id: number): void {
    this.isLoading = true;

    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        const cpfFormatado = this.formatarCPFString(paciente.cpf);
        const telefoneFormatado = this.formatarTelefoneString(paciente.telefoneWhatsapp);
        const dataFormatada = this.formatarDataString(paciente.dataNascimento);

        this.pacienteForm.patchValue({
          nomeCompleto: paciente.nomeCompleto,
          cpf: cpfFormatado,
          dataNascimento: dataFormatada,
          sexo: paciente.sexo,
          telefoneWhatsapp: telefoneFormatado,
          email: paciente.email,
          prontuario: paciente.prontuario
        }, { emitEvent: false });

        this.isLoading = false;
      },
      error: (erro) => {
        this.toastService.error('Erro ao carregar dados do paciente.');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  private formatarCPFString(cpf: string): string {
    if (!cpf) return '';
    const apenasNumeros = cpf.replace(/\D/g, '');
    if (apenasNumeros.length !== 11) return cpf;
    
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private formatarTelefoneString(telefone: string): string {
    if (!telefone) return '';
    const apenasNumeros = telefone.replace(/\D/g, '');
    if (apenasNumeros.length !== 11) return telefone;
    
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  // Formata data de "1990-06-15" ou "1990-06-15T00:00:00.000Z" para "15/06/1990"
  private formatarDataString(data: string): string {
    if (!data) return '';
    
    // Se já estiver no formato DD/MM/YYYY, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }
    
    // Remove timezone se existir (formato ISO)
    const dataLimpa = data.split('T')[0];
    
    // Assume formato YYYY-MM-DD
    const partes = dataLimpa.split('-');
    if (partes.length === 3) {
      return `${partes[2].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[0]}`;
    }
    return data;
  }

  private dataParaISO(data: string): string {
    if (!data) return '';
    const partes = data.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return data;
  }

  formatarCPF(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      input.value = valor;
      this.pacienteForm.patchValue({ cpf: valor }, { emitEvent: false });
    }
  }

  formatarTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 11) {
      valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
      valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
      input.value = valor;
      this.pacienteForm.patchValue({ telefoneWhatsapp: valor }, { emitEvent: false });
    }
  }

  formatarData(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 8) {
      valor = valor.replace(/(\d{2})(\d)/, '$1/$2');
      valor = valor.replace(/(\d{2})(\d)/, '$1/$2');
      input.value = valor;
      this.pacienteForm.patchValue({ dataNascimento: valor }, { emitEvent: false });
    }
  }

  abrirCalendario(hiddenInput: HTMLInputElement): void {
    const dataAtual = this.pacienteForm.get('dataNascimento')?.value;
    if (dataAtual && dataAtual.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const partes = dataAtual.split('/');
      const dataISO = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      hiddenInput.value = dataISO;
    }

    if (typeof hiddenInput.showPicker === 'function') {
      hiddenInput.showPicker();
    } else {
      hiddenInput.click();
    }
  }

  onDateSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const dataISO = input.value;

    if (dataISO) {
      const dataFormatada = this.formatarDataString(dataISO);
      this.pacienteForm.patchValue({ dataNascimento: dataFormatada });
    }
  }

  onSubmit(): void {
    if (this.pacienteForm.valid) {
      this.isSaving = true;
      const formValue = this.pacienteForm.value;

      let dataNascimentoFinal: string;
      try {
        const dataISO = this.dataParaISO(formValue.dataNascimento);
        if (!dataISO || dataISO === formValue.dataNascimento) {
          throw new Error('Conversão de data falhou');
        }
        const dataObj = new Date(dataISO + 'T12:00:00');
        if (isNaN(dataObj.getTime())) {
          throw new Error('Data inválida');
        }
        dataNascimentoFinal = dataObj.toISOString().split('T')[0];
      } catch (error) {
        this.toastService.error('Data de nascimento inválida. Use o formato DD/MM/YYYY');
        return;
      }

      const pacienteData: PacienteDTO = {
        ...formValue,
        cpf: this.removerMascara(formValue.cpf),
        telefoneWhatsapp: this.removerMascara(formValue.telefoneWhatsapp),
        dataNascimento: dataNascimentoFinal
      };

      const operacao = this.isEditMode
        ? this.pacienteService.atualizar(this.pacienteId!, pacienteData)
        : this.pacienteService.cadastrar(pacienteData);

      operacao.subscribe({
        next: (paciente) => {
          this.toastService.success(
            this.isEditMode
              ? 'Paciente atualizado com sucesso!'
              : 'Paciente cadastrado com sucesso!'
          );
          this.router.navigate(['/pacientes', paciente.id]);
        },
        error: (erro) => {
          this.toastService.error('Erro ao salvar paciente. Verifique os dados e tente novamente.');
          this.isSaving = false;
        }
      });
    } else {
      this.toastService.warning('Por favor, preencha todos os campos obrigatórios');
      this.marcarCamposComoTocados();
    }
  }

  private removerMascara(valor: string): string {
    return valor ? valor.replace(/\D/g, '') : '';
  }

  cancelar(): void {
    if (this.isEditMode && this.pacienteId) {
      // Volta para os detalhes do paciente
      this.router.navigate(['/pacientes', this.pacienteId]);
    } else {
      // Volta para a lista de pacientes
      this.router.navigate(['/pacientes']);
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.pacienteForm.controls).forEach(field => {
      const control = this.pacienteForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getCampoErro(campo: string): string | null {
    const control = this.pacienteForm.get(campo);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo obrigatório';
      if (control.errors['minlength']) return 'Nome muito curto';
      if (control.errors['pattern']) {
        if (campo === 'cpf') return 'CPF inválido';
        if (campo === 'telefoneWhatsapp') return 'Telefone inválido';
      }
      if (control.errors['email']) return 'E-mail inválido';
      if (control.errors['formatoInvalido']) return 'Data deve estar no formato DD/MM/YYYY';
      if (control.errors['dataInvalida']) return 'Data inválida';
      if (control.errors['dataFutura']) return 'Data não pode ser futura';
    }
    return null;
  }
}