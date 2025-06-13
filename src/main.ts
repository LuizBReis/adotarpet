import { bootstrapApplication } from '@angular/platform-browser';
// Importe 'withInterceptorsFromDi' junto com provideHttpClient
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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
import { AppComponent } from './app/app.component';
import { authGuard } from './app/guards/auth.guard';
import { UserManagementComponent } from './app/pages/user-management/user-management.component';
// Importe HTTP_INTERCEPTORS da forma correta
import { HTTP_INTERCEPTORS } from '@angular/common/http';
// Importe o AuthInterceptor
import { AuthInterceptor } from './app/interceptors/auth.interceptor';


bootstrapApplication(AppComponent, {
  providers: [
    // 1. Chame provideHttpClient com withInterceptorsFromDi().
    // Isso é crucial para que o HttpClient procure por interceptors registrados via DI.
    provideHttpClient(withInterceptorsFromDi()),
    
    // 2. Registre o seu interceptor. A ordem é importante, deve vir depois de provideHttpClient().
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Permite que você adicione outros interceptors no futuro, se precisar
    },

    // 3. O restante dos seus providers, como provideRouter, provideAnimations, etc.
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
        canActivate: [authGuard],
        data: { roles: ['ong', 'admin'] }
      },
      {
        path: 'editar-evento',
        component: EditarEventoComponent,
        canActivate: [authGuard],
        data: { roles: ['ong', 'admin'] }
      },
      {
        path: 'editar-evento/:id',
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
      { path: 'evento/:id', loadComponent: () => import('./app/pages/evento-detalhes/evento-detalhes.component').then(m => m.EventoDetalhesComponent)},
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      // { path: '**', redirectTo: 'login' } // Opcional: catch-all para rotas não encontradas
    ]),
    provideAnimations(),
    ReactiveFormsModule,
    // Módulos do Material devem ser importados nos componentes que os usam,
    // ou num AppModule se você tiver um. Não aqui em provideHttpClient().
  ]
}).catch(err => console.error(err));