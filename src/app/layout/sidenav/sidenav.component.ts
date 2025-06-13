import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service'; // Mantenha
import { Router } from '@angular/router'; // Mantenha
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [MatSidenavModule, CommonModule, MatIconModule],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(300, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  isSidebarVisible = true;
  isSubmenuOpen = false;
  pets: any[] = [];
  // --- NOVO: Variável para o papel do usuário ---
  userRole: string | null = null;
  // -----------------------------------------------

  constructor(
    private sidebarService: SidebarService,
    private petService: PetService,
    private accesoService: AccesoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      this.isSidebarVisible = isVisible;
    });

    this.listarpets();

    // --- NOVO: Obter o papel do usuário logado ---
    this.userRole = this.accesoService.getDonoRole();
    // Você pode querer observar mudanças no role se o usuário puder mudar de role sem refresh
    // Mas para login/logout, isso já é suficiente.
    // ----------------------------------------------
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarService.toggleSidebar();
  }

  toggleSubmenu() {
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }

  // --- NOVO: Métodos de verificação de papel ---
  isOngOrAdmin(): boolean {
    return this.accesoService.hasRole(['ong', 'admin']);
  }

  isAdmin(): boolean {
    return this.accesoService.hasRole(['admin']);
  }
  // ----------------------------------------------

  cadastrarPet() {
    console.log('Cadastrando pet');
    this.router.navigate(['/cadastro-pet']);
  }

  Eventos() {
    console.log('Entrando em Eventos');
    this.router.navigate(['/eventos']);
  }

  cadastroEvento() {
    console.log('Cadastrando Evento'); // Ajustei o console.log
    this.router.navigate(['/cadastro-eventos']);
  }

  editarEvento() {
    console.log('Editando Evento'); // Ajustei o console.log
    this.router.navigate(['/editar-evento']);
  }

  GerenciarUser() {
    console.log('Editando Evento'); // Ajustei o console.log
    this.router.navigate(['/gerenciar-usuarios']);
  }

  adotarPet() {
    console.log('Adotando pet');
    this.router.navigate(['/adotar-pet']);
  }

  config() {
    console.log('Configurações');
    this.router.navigate(['/Config']);
  }

  logout() {
    console.log('Logging out...');
    this.accesoService.logout();
    this.router.navigate(['/login']);
  }

  listarpets() {
    const donoId = this.accesoService.getDonoId();
    if (donoId) {
      this.petService.getPetsByDono(donoId).subscribe((pets) => {
        this.pets = pets;
        console.log('Lista de pets:', pets);
      });
    } else {
      console.log('Dono não logado.');
    }
  }

  editarPet(petId: number) {
    this.router.navigate(['/editar-pet', { id: petId }]);
  }
}