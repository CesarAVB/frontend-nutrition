import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Paciente {
  id: number;
  nomeCompleto: string;
  iniciais: string;
  ultimaVisita: string;
  telefone: string;
}

interface Consulta {
  paciente: Paciente;
  tipo: string;
  horario: string;
}

interface DashboardStats {
  totalPacientes: number;
  consultasHoje: number;
  consultasMes: number;
  proximaConsulta: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalPacientes: 5,
    consultasHoje: 4,
    consultasMes: 28,
    proximaConsulta: '09:00'
  };

  consultasHoje: Consulta[] = [
    {
      paciente: {
        id: 1,
        nomeCompleto: 'Maria Silva Santos',
        iniciais: 'MS',
        ultimaVisita: '07/01/2025',
        telefone: '21999887766'
      },
      tipo: 'Retorno',
      horario: '09:00'
    },
    {
      paciente: {
        id: 2,
        nomeCompleto: 'João Pedro Oliveira',
        iniciais: 'JP',
        ultimaVisita: '05/01/2025',
        telefone: '21987654321'
      },
      tipo: 'Avaliação',
      horario: '10:30'
    },
    {
      paciente: {
        id: 3,
        nomeCompleto: 'Ana Carolina Lima',
        iniciais: 'AC',
        ultimaVisita: '09/01/2025',
        telefone: '21976543210'
      },
      tipo: 'Retorno',
      horario: '14:00'
    },
    {
      paciente: {
        id: 4,
        nomeCompleto: 'Carlos Eduardo Mendes',
        iniciais: 'CE',
        ultimaVisita: '04/01/2025',
        telefone: '21965432109'
      },
      tipo: 'Primeira Consulta',
      horario: '16:00'
    }
  ];

  pacientesRecentes: Paciente[] = [
    {
      id: 1,
      nomeCompleto: 'Maria Silva Santos',
      iniciais: 'MS',
      ultimaVisita: '07/01/2025',
      telefone: '21999887766'
    },
    {
      id: 2,
      nomeCompleto: 'João Pedro Oliveira',
      iniciais: 'JP',
      ultimaVisita: '05/01/2025',
      telefone: '21987654321'
    },
    {
      id: 3,
      nomeCompleto: 'Ana Carolina Lima',
      iniciais: 'AC',
      ultimaVisita: '09/01/2025',
      telefone: '21976543210'
    },
    {
      id: 4,
      nomeCompleto: 'Carlos Eduardo Mendes',
      iniciais: 'CE',
      ultimaVisita: '04/01/2025',
      telefone: '21965432109'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Dados carregados no construtor para este exemplo
  }

  verTodosPacientes(): void {
    this.router.navigate(['/pacientes']);
  }

  ligarPaciente(telefone: string): void {
    window.open(`https://wa.me/55${telefone.replace(/\D/g, '')}`, '_blank');
  }

  verDetalhesPaciente(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }
}