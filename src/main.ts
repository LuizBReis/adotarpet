import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms'; // Importar aqui o ReactiveFormsModule
import { LoginComponent } from './app/pages/login/login.component';
import { RegistroComponent } from './app/pages/registro/registro.component';
import { InicioComponent } from './app/pages/inicio/inicio.component';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { EditarPetComponent } from './app/pages/editar-pet/editar-pet.component';
import { CadastroPetComponent } from './app/pages/cadastro-pet/cadastro-pet.component'; 
import { AdotarPetComponent } from './app/pages/adotar-pet/adotar-pet.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AppComponent } from './app/app.component';
import { EventosComponent } from './app/pages/eventos/eventos.component';
import { CadastroEventoComponent } from './app/pages/cadastro-evento/cadastro-evento.component';
import { appConfig } from './app/app.config';
import { EditarEventoComponent } from './app/pages/editar-evento/editar-evento.component';
import { EditarEventoFormComponent } from './app/pages/editar-evento/editar-evento-form.component';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    appConfig,
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'registro', component: RegistroComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'cadastro-pet', component: CadastroPetComponent }, 
      {path: 'editar-pet', component: EditarPetComponent},
      {path: 'adotar-pet', component: AdotarPetComponent},
      {path: 'eventos', component: EventosComponent},
      {path: 'cadastro-eventos', component: CadastroEventoComponent},
      {path: 'evento/:id', loadComponent: () => import('./app/pages/evento-detalhes/evento-detalhes.component').then(m => m.EventoDetalhesComponent)},
      { path: 'editar-evento', component: EditarEventoComponent },
      { path: 'editar-evento/:id', component: EditarEventoFormComponent }

    ]),
    provideAnimations(),
    ReactiveFormsModule, // Adicionar ReactiveFormsModule aqui
    MatButtonModule,
    MatTableModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatCardModule
  ]
}).catch(err => console.error(err));
