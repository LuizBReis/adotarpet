import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ProfileComponent } from './pages/profile/profile.component'; // Adicione o ProfileComponent
import { CadastroPetComponent } from './pages/cadastro-pet/cadastro-pet.component'; // Importe o CadastroPetComponent
import { EditarPetComponent } from './pages/editar-pet/editar-pet.component';
import { AdotarPetComponent } from './pages/adotar-pet/adotar-pet.component';
import { EventosComponent } from './pages/eventos/eventos.component';
import { EditarEventoComponent } from './pages/editar-evento/editar-evento.component';
import { EditarEventoFormComponent } from './pages/editar-evento/editar-evento-form.component'; 

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redireciona para login se estiver vazio
  { path: 'login', component: LoginComponent }, // Página de login
  { path: 'registro', component: RegistroComponent }, // Página de registro
  { path: 'inicio', component: InicioComponent }, // Página inicial (home) após login
  { path: 'profile', component: ProfileComponent }, // Página de perfil
  { path: 'cadastro-pet', component: CadastroPetComponent },
  { path: 'editar-pet/:id', component: EditarPetComponent }, // Adicionado o parâmetro :id
  { path: 'adotar-pet', component: AdotarPetComponent },
  { path: 'eventos', component: EventosComponent },
  { path: 'cadastro-eventos', component: CadastroPetComponent },
  { path: 'editar-evento', component: EditarEventoComponent },
  { path: 'editar-evento/:id', component: EditarEventoFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
