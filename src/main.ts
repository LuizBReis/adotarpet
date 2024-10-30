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
      {path: 'editar-pet', component: EditarPetComponent},
      {path: 'adotar-pet', component: AdotarPetComponent},
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
