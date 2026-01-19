// src/app/pages/pacientes/paciente-form/paciente-form.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
      dataNascimento: ['', Validators.required],
      sexo: ['', Validators.required],
      telefoneWhatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      email: ['', [Validators.email]],
      prontuario: ['']
    });
  }

  ngOnInit(): void {
    // Verifica se é uma rota de edição
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
        console.log('Paciente carregado:', paciente);
        
        // Formata CPF e telefone antes de preencher o formulário
        const cpfFormatado = this.formatarCPFString(paciente.cpf);
        const telefoneFormatado = this.formatarTelefoneString(paciente.telefoneWhatsapp);
        
        console.log('CPF formatado:', cpfFormatado);
        console.log('Telefone formatado:', telefoneFormatado);
        
        this.pacienteForm.patchValue({
          nomeCompleto: paciente.nomeCompleto,
          cpf: cpfFormatado,
          dataNascimento: paciente.dataNascimento,
          sexo: paciente.sexo,
          telefoneWhatsapp: telefoneFormatado,
          email: paciente.email,
          prontuario: paciente.prontuario
        });
        
        this.isLoading = false;
        
        // Log para debug
        console.log('Formulário após patchValue:', this.pacienteForm.value);
        console.log('Formulário válido?', this.pacienteForm.valid);
        console.log('Erros do formulário:', this.pacienteForm.errors);
        
        // Log de cada campo
        Object.keys(this.pacienteForm.controls).forEach(key => {
          const control = this.pacienteForm.get(key);
          if (control?.invalid) {
            console.log(`Campo ${key} inválido:`, control.errors);
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao carregar paciente:', erro);
        this.toastService.error('Erro ao carregar dados do paciente.');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  // Formata CPF de "12345678900" para "123.456.789-00"
  private formatarCPFString(cpf: string): string {
    if (!cpf) return '';
    const apenasNumeros = cpf.replace(/\D/g, '');
    if (apenasNumeros.length !== 11) return cpf;
    
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // Formata telefone de "11999999999" para "(11) 99999-9999"
  private formatarTelefoneString(telefone: string): string {
    if (!telefone) return '';
    const apenasNumeros = telefone.replace(/\D/g, '');
    if (apenasNumeros.length !== 11) return telefone;
    
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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

  onSubmit(): void {
    console.log('onSubmit chamado');
    console.log('Formulário válido?', this.pacienteForm.valid);
    console.log('Valores do formulário:', this.pacienteForm.value);
    
    if (this.pacienteForm.valid) {
      this.isSaving = true;
      const formValue = this.pacienteForm.value;
      
      // Remove máscaras antes de enviar
      const pacienteData: PacienteDTO = {
        ...formValue,
        cpf: this.removerMascara(formValue.cpf),
        telefoneWhatsapp: this.removerMascara(formValue.telefoneWhatsapp)
      };
      
      console.log('Dados a serem enviados:', pacienteData);
      
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
          // Navega para a página de detalhes do paciente
          this.router.navigate(['/pacientes', paciente.id]);
        },
        error: (erro) => {
          console.error('Erro ao salvar paciente:', erro);
          this.toastService.error('Erro ao salvar paciente. Verifique os dados e tente novamente.');
          this.isSaving = false;
        }
      });
    } else {
      console.log('Formulário inválido, marcando campos como tocados');
      this.toastService.warning('Por favor, preencha todos os campos obrigatórios');
      this.marcarCamposComoTocados();
      
      // Mostra quais campos estão inválidos
      Object.keys(this.pacienteForm.controls).forEach(key => {
        const control = this.pacienteForm.get(key);
        if (control?.invalid) {
          console.log(`Campo ${key} inválido:`, control.errors);
        }
      });
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
    }
    return null;
  }
}