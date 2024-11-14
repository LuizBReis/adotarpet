import { Component, OnInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Pet {
  id: number;
  nome: string;
  idade: number;
  tipo: string;
  raca: string;
  porte: string;
  castrado: boolean;
  donoId: number;
  paraAdocao: boolean;
  imagens: string[];
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
    donoId: 0,
    paraAdocao: false,
    imagens: []
  };
  isEditMode = false;
  petId: number | null = null;
  novasImagens: File[] = []; // Declaração de novas imagens como um array de arquivos
  imagensParaRemover: string[] = []; // Array para armazenar as imagens a serem removidas

  constructor(
    private petService: PetService,
    private accesoService: AccesoService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.petId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.petId) {
      this.loadPetData();
    } else {
      console.error('ID do Pet é null.');
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
      const formData = new FormData();
      formData.append('nome', this.pet.nome);
      formData.append('idade', String(this.pet.idade));
      formData.append('tipo', this.pet.tipo);
      formData.append('raca', this.pet.raca);
      formData.append('porte', this.pet.porte);
      formData.append('castrado', String(this.pet.castrado));
      formData.append('paraAdocao', String(this.pet.paraAdocao));
  
      // Adicionar as imagens existentes no pet (caso haja), mas sem as imagens removidas
      const imagensParaEnviar = this.pet.imagens.filter(image => !this.imagensParaRemover.includes(image));
      for (let i = 0; i < imagensParaEnviar.length; i++) {
        formData.append('imagens', imagensParaEnviar[i]);
      }
  
      // Adicionar as novas imagens ao array
      for (let i = 0; i < this.novasImagens.length; i++) {
        formData.append('imagens', this.novasImagens[i]);
      }
  
      // Adicionar as imagens a serem removidas
      for (let i = 0; i < this.imagensParaRemover.length; i++) {
        formData.append('removerImagens', this.imagensParaRemover[i]);
      }
  
      // Enviar o FormData com todas as imagens (existentes e novas)
      this.petService.updatePet(this.petId, formData).subscribe(
        (response) => {
          console.log('Dados do pet atualizados com sucesso!');
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
    this.loadPetData();
  }

  deletePet() {
    if (this.petId !== null) {
      const confirmDelete = confirm('Tem certeza de que deseja excluir este pet?');
      if (confirmDelete) {
        this.petService.deletePet(this.petId).subscribe(
          () => {
            console.log('Pet excluído com sucesso.');
            this.router.navigate(['/inicio']);
          },
          (error) => {
            console.error('Erro ao excluir o pet:', error);
          }
        );
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.novasImagens = Array.from(input.files); // Armazena os arquivos selecionados
    }
  }

// Método para remover uma imagem do pet
removerImagem(imagemUrl: string) {
  if (this.petId !== null) {
  this.petService.removerImagem(this.petId, imagemUrl).subscribe(
    (petAtualizado) => {
      this.pet = petAtualizado; // Atualiza o pet com os dados mais recentes, incluindo a lista de imagens
      console.log('Imagem removida com sucesso', petAtualizado);
    },
    (erro) => {
      console.error('Erro ao remover a imagem:', erro);
    }
  );
}
}
  
}
