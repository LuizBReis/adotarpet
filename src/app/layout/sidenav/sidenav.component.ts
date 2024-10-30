import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  pets: any[] = []; // Lista de pets do usuário

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

    this.listarpets(); // Carrega a lista de pets ao iniciar o componente
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarService.toggleSidebar();
  }

  toggleSubmenu() {
    this.isSubmenuOpen = !this.isSubmenuOpen;
  }

  cadastrarPet() {
    console.log('Cadastrando pet');
    this.router.navigate(['/cadastro-pet']);
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
    const donoId = this.accesoService.getDonoId(); // Obtém o ID do dono logado
    if (donoId) {
      this.petService.getPetsByDono(donoId).subscribe((pets) => {
        this.pets = pets; // Atribui os pets à variável
        console.log('Lista de pets:', pets);
      });
    } else {
      console.log('Dono não logado.');
    }
  }

  // Método para editar o pet e redirecionar para a página de edição
  editarPet(petId: number) {
    this.router.navigate(['/editar-pet', { id: petId }]); // Redireciona para a página de edição com o ID do pet
  }
}
