import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PacientesListComponent } from './pages/pacientes/pacientes-list/pacientes-list';
import { PacienteFormComponent } from './pages/pacientes/paciente-form/paciente-form';
import { ConsultaFormComponent } from './pages/consultas/consulta-form/consulta-form';

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
    path: 'pacientes/:id',
    component: PacienteFormComponent,
    title: 'Editar Paciente - NutriControl'
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
  /*{
    path: 'dietas',
    loadComponent: () => import('./pages/dietas/dietas').then(m => m.DietasComponent),
    title: 'Dietas - NutriControl'
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./pages/configuracoes/configuracoes.component').then(m => m.ConfiguracoesComponent),
    title: 'Configurações - NutriControl'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
    */
];