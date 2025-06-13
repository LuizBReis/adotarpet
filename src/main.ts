import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './app/pages/login/login.component';
import { RegistroComponent } from './app/pages/registro/registro.component';
import { InicioComponent } from './app/pages/inicio/inicio.component';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { ProfileComponent } from './app/pages/profile/profile.component';
import { EditarPetComponent } from './app/pages/editar-pet/editar-pet.component';
import { CadastroPetComponent } from './app/pages/cadastro-pet/cadastro-pet.component';
import { AdotarPetComponent } from './app/pages/adotar-pet/adotar-pet.component';
import { EventosComponent } from './app/pages/eventos/eventos.component';
import { CadastroEventoComponent } from './app/pages/cadastro-evento/cadastro-evento.component';
import { EditarEventoComponent } from './app/pages/editar-evento/editar-evento.component';
import { EditarEventoFormComponent } from './app/pages/editar-evento/editar-evento-form.component';
import { ForgotPasswordComponent } from './app/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './app/pages/reset-password/reset-password.component';
import { AppComponent } from './app/app.component'; // Garanta que AppComponent está importado
import { authGuard } from './app/guards/auth.guard'; // <--- Importe seu novo guard
import { UserManagementComponent } from './app/pages/user-management/user-management.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'registro', component: RegistroComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'cadastro-pet', component: CadastroPetComponent },
      { path: 'editar-pet', component: EditarPetComponent },
      { path: 'adotar-pet', component: AdotarPetComponent },
      { path: 'eventos', component: EventosComponent },
      // Rotas de Eventos Protegidas:
      {
        path: 'cadastro-eventos',
        component: CadastroEventoComponent,
        canActivate: [authGuard], // <--- Aplica o guard
        data: { roles: ['ong', 'admin'] } // <--- Define os papéis permitidos
      },
      {
        path: 'editar-evento', // Esta rota provavelmente listaria eventos para edição
        component: EditarEventoComponent,
        canActivate: [authGuard],
        data: { roles: ['ong', 'admin'] }
      },
      {
        path: 'editar-evento/:id', // Esta rota seria para o formulário de edição específico
        component: EditarEventoFormComponent,
        canActivate: [authGuard],
        data: { roles: ['ong', 'admin'] }
      },
      {
        path: 'gerenciar-usuarios',
        component: UserManagementComponent,
        canActivate: [authGuard],
        data: { roles: ['admin'] } 
      },
      // ... outras rotas
      { path: 'evento/:id', loadComponent: () => import('./app/pages/evento-detalhes/evento-detalhes.component').then(m => m.EventoDetalhesComponent)},
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      // { path: '**', redirectTo: 'login' } // Opcional: catch-all para rotas não encontradas
    ]),
    provideAnimations(),
    ReactiveFormsModule,
    // Removi os módulos do Material aqui, eles devem ser importados nos componentes que os usam,
    // ou em um AppModule se você tiver um.
    // MatButtonModule, MatTableModule, MatSidenavModule, MatToolbarModule, MatMenuModule,
    // MatIconModule, MatDividerModule, MatListModule, MatCardModule
  ]
}).catch(err => console.error(err));