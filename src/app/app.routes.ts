import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProfileComponent } from './pages/profile/profile.component'; // Importação do ProfileComponent
import { EditarEventoComponent } from './pages/editar-evento/editar-evento.component';
import { EditarEventoFormComponent } from './pages/editar-evento/editar-evento-form.component'; 
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Página de login
  { path: 'registro', component: RegistroComponent }, // Página de registro
  { path: 'inicio', component: InicioComponent }, // Página inicial (home) após login
  { path: 'profile', component: ProfileComponent }, // Adiciona a rota para a página de perfil
  { path: 'evento/:id', loadComponent: () => import('./pages/evento-detalhes/evento-detalhes.component').then(m => m.EventoDetalhesComponent)},
  { path: 'editar-evento', component: EditarEventoComponent },
  { path: 'editar-evento/:id', component: EditarEventoFormComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent},
  { path: 'reset-password/:token', component: ResetPasswordComponent },

];

export const appConfig = [
  provideRouter(routes) // Configura o roteamento
];
