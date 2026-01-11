import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Paciente {
  id: number;
  iniciais: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
  telefoneWhatsapp: string;
  ultimaVisita: string;
  totalConsultas: number;
}

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-list.html',
  styleUrls: ['./pacientes-list.scss']
})
export class PacientesListComponent implements OnInit {
  searchTerm = '';
  pacientes: Paciente[] = [
    {
      id: 1,
      iniciais: 'MS',
      nomeCompleto: 'Maria Silva Santos',
      email: 'maria.santos@email.com',
      cpf: '123.456.789-00',
      telefoneWhatsapp: '21999887766',
      ultimaVisita: '07/01/2025',
      totalConsultas: 5
    },
    {
      id: 2,
      iniciais: 'JP',
      nomeCompleto: 'João Pedro Oliveira',
      email: 'joao.oliveira@email.com',
      cpf: '987.654.321-00',
      telefoneWhatsapp: '21987654321',
      ultimaVisita: '05/01/2025',
      totalConsultas: 3
    },
    {
      id: 3,
      iniciais: 'AC',
      nomeCompleto: 'Ana Carolina Lima',
      email: 'ana.lima@email.com',
      cpf: '456.789.123-00',
      telefoneWhatsapp: '21976543210',
      ultimaVisita: '09/01/2025',
      totalConsultas: 2
    },
    {
      id: 4,
      iniciais: 'CE',
      nomeCompleto: 'Carlos Eduardo Mendes',
      email: 'carlos.mendes@email.com',
      cpf: '321.654.987-00',
      telefoneWhatsapp: '21965432109',
      ultimaVisita: '04/01/2025',
      totalConsultas: 4
    },
    {
      id: 5,
      iniciais: 'FC',
      nomeCompleto: 'Fernanda Costa Ribeiro',
      email: 'fernanda.ribeiro@email.com',
      cpf: '789.123.456-00',
      telefoneWhatsapp: '21954321098',
      ultimaVisita: '08/01/2025',
      totalConsultas: 1
    }
  ];

  pacientesFiltrados: Paciente[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.pacientesFiltrados = this.pacientes;
  }

  filtrarPacientes(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    
    if (!termo) {
      this.pacientesFiltrados = this.pacientes;
      return;
    }

    this.pacientesFiltrados = this.pacientes.filter(p => 
      p.nomeCompleto.toLowerCase().includes(termo) ||
      p.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
    );
  }

  novoPaciente(): void {
    this.router.navigate(['/pacientes/novo']);
  }

  abrirWhatsApp(telefone: string): void {
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank');
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }
}