import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProfileComponent } from './pages/profile/profile.component'; // Importação do ProfileComponent

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Página de login
  { path: 'registro', component: RegistroComponent }, // Página de registro
  { path: 'inicio', component: InicioComponent }, // Página inicial (home) após login
  { path: 'profile', component: ProfileComponent } // Adiciona a rota para a página de perfil
];

export const appConfig = [
  provideRouter(routes) // Configura o roteamento
];
