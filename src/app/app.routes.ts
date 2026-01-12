import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PacientesListComponent } from './pages/pacientes/pacientes-list/pacientes-list';
import { PacienteFormComponent } from './pages/pacientes/paciente-form/paciente-form';
import { PacienteDetailsComponent } from './pages/pacientes/paciente-details/paciente-details';
import { ConsultaFormComponent } from './pages/consultas/consulta-form/consulta-form';
import { ConsultaDetailsComponent } from './pages/consultas/consulta-details/consulta-details';
import { ConsultasListComponent } from './pages/consultas/consultas-list/consultas-list';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard - NutriControl'
  },
  {
    path: 'pacientes',
    component: PacientesListComponent,
    title: 'Pacientes - NutriControl'
  },
  {
    path: 'pacientes/novo',
    component: PacienteFormComponent,
    title: 'Novo Paciente - NutriControl'
  },
  {
    path: 'pacientes/:id/editar',
    component: PacienteFormComponent,
    title: 'Editar Paciente - NutriControl'
  },
  {
    path: 'pacientes/:id',
    component: PacienteDetailsComponent,
    title: 'Detalhes do Paciente - NutriControl'
  },
  {
    path: 'pacientes/:id/consulta',
    component: ConsultaFormComponent,
    title: 'Nova Consulta - NutriControl'
  },
  {
    path: 'consultas/nova',
    component: ConsultaFormComponent,
    title: 'Nova Consulta - NutriControl'
  },
  {
    path: 'consultas/:id',
    component: ConsultaDetailsComponent,
    title: 'Detalhes da Consulta - NutriControl'
  },
  {
    path: 'consultas',
    component: ConsultasListComponent,
    title: 'Consultas - NutriControl'
  },
];