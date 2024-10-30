import { Component, OnInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Import necessário para obter o ID pela rota

// Atualizando a interface Pet para incluir 'paraAdocao'
interface Pet {
  id: number; // O ID pode ser opcional na interface Pet
  nome: string;
  idade: number;
  tipo: string;
  raca: string;
  porte: string;
  castrado: boolean;
  donoId: number; // Agora incluímos o donoId
  paraAdocao: boolean; // Adicionando o campo para adoção
}

@Component({
  selector: 'app-editar-pet',
  templateUrl: './editar-pet.component.html',
  styleUrls: ['./editar-pet.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, FormsModule]
})
export class EditarPetComponent implements OnInit {
  pet: Pet = {
    id: 0,
    nome: '',
    idade: 0,
    tipo: '',
    raca: '',
    porte: '',
    castrado: false,
    donoId: 0, // Inicialize donoId com 0 ou outro valor padrão
    paraAdocao: false // Inicialize paraAdocao com false
  };
  isEditMode = false;
  petId: number | null = null;

  constructor(
    private petService: PetService, 
    private accesoService: AccesoService,
    private route: ActivatedRoute, // Para acessar parâmetros da rota
    public router: Router // Para redirecionar após exclusão
  ) {}

  ngOnInit() {
    // Obter o petId da rota atual
    this.petId = Number(this.route.snapshot.paramMap.get('id')); 

    if (this.petId) {
      this.loadPetData();
    } else {
      console.error('ID do Pet é null. Certifique-se de que o pet esteja selecionado.');
    }
  }

  loadPetData() {
    if (this.petId !== null) {
      this.petService.getPet(this.petId).subscribe(
        (data: Pet) => {
          this.pet = data;
          console.log('Pet carregado:', this.pet);
        },
        (error) => {
          console.error('Erro ao carregar dados do pet:', error);
        }
      );
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveChanges() {
    if (this.petId !== null) {
      this.petService.updatePet(this.petId, this.pet).subscribe(
        (response) => {
          console.log('Dados do pet atualizados com sucesso!');
          this.toggleEditMode();
          alert('Dados do pet atualizados com sucesso!');
          this.router.navigate(['/inicio']);
        },
        (error) => {
          console.error('Erro ao atualizar dados do pet:', error);
        }
      );
    }
  }

  cancelEdit() {
    this.toggleEditMode();
    this.loadPetData(); // Recarregar dados do servidor
  }

  deletePet() {
    if (this.petId !== null) {
      const confirmDelete = confirm('Tem certeza de que deseja excluir este pet? Esta ação não pode ser desfeita.');

      if (confirmDelete) {
        this.petService.deletePet(this.petId).subscribe(
          () => {
            console.log('Pet excluído com sucesso.');
            this.router.navigate(['/inicio']); // Redirecionar para a lista de pets ou outra página
          },
          (error) => {
            console.error('Erro ao excluir o pet:', error);
            if (error.error) {
              console.error('Detalhes do erro:', error.error);
            }
          }
        );
      }
    }
  }
}
