import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.pacienteForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      dataNascimento: ['', Validators.required],
      telefoneWhatsapp: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{5}-\d{4}$/)]],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit(): void {
    this.pacienteId = this.route.snapshot.params['id'];
    if (this.pacienteId) {
      this.isEditMode = true;
      this.carregarPaciente(this.pacienteId);
    }
  }

  carregarPaciente(id: number): void {
    // Simula carregamento de dados do backend
    // Aqui você faria uma chamada para o serviço HTTP
    const pacienteMock = {
      nomeCompleto: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      dataNascimento: '1990-05-15',
      telefoneWhatsapp: '(21) 99988-7766',
      email: 'maria.santos@email.com'
    };
    
    this.pacienteForm.patchValue(pacienteMock);
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
    if (this.pacienteForm.valid) {
      const formData = this.pacienteForm.value;
      console.log('Dados do formulário:', formData);
      
      // Aqui você faria a chamada para o backend
      // if (this.isEditMode) {
      //   this.pacienteService.atualizar(this.pacienteId, formData).subscribe(...)
      // } else {
      //   this.pacienteService.cadastrar(formData).subscribe(...)
      // }
      
      alert(this.isEditMode ? 'Paciente atualizado com sucesso!' : 'Paciente cadastrado com sucesso!');
      this.router.navigate(['/pacientes']);
    } else {
      this.marcarCamposComoTocados();
    }
  }

  cancelar(): void {
    this.router.navigate(['/pacientes']);
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