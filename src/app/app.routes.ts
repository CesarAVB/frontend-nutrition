import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { PacientesListComponent } from './pages/pacientes/pacientes-list/pacientes-list';
import { PacienteFormComponent } from './pages/pacientes/paciente-form/paciente-form';
import { PacienteDetailsComponent } from './pages/pacientes/paciente-details/paciente-details';
import { ConsultaFormComponent } from './pages/consultas/consulta-form/consulta-form';
import { ConsultaDetailsComponent } from './pages/consultas/consulta-details/consulta-details';
import { ConsultasListComponent } from './pages/consultas/consultas-list/consultas-list';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - NutriControl'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'pacientes',
    component: PacientesListComponent,
    title: 'Pacientes - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'pacientes/novo',
    component: PacienteFormComponent,
    title: 'Novo Paciente - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'pacientes/:id/editar',
    component: PacienteFormComponent,
    title: 'Editar Paciente - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'pacientes/:id',
    component: PacienteDetailsComponent,
    title: 'Detalhes do Paciente - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'pacientes/:id/consulta',
    component: ConsultaFormComponent,
    title: 'Nova Consulta - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'consultas/nova',
    component: ConsultaFormComponent,
    title: 'Nova Consulta - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'consultas/:id',
    component: ConsultaDetailsComponent,
    title: 'Detalhes da Consulta - NutriControl',
    canActivate: [authGuard]
  },
  {
    path: 'consultas',
    component: ConsultasListComponent,
    title: 'Consultas - NutriControl',
    canActivate: [authGuard]
  },
];