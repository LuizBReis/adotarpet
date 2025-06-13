import { Component, OnInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';
import { MatCheckboxModule } from '@angular/material/checkbox'; // <--- Adicionado para mat-checkbox

interface Pet {
  id: number;
  nome: string;
  idade: number;
  tipo: string;
  raca: string;
  porte: string;
  castrado: boolean;
  donoId: number;
  paraAdocao: boolean; // Certifique-se que está na interface
  imagens: string[]; // Mantém o nome 'imagens'
}

@Component({
  selector: 'app-editar-pet',
  templateUrl: './editar-pet.component.html',
  styleUrls: ['./editar-pet.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, FormsModule, HeaderComponent, SidebarComponent, MatCheckboxModule] // <--- Adicionado MatCheckboxModule
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
    paraAdocao: false, // Inicialize paraAdocao
    imagens: []
  };
  isEditMode = false;
  petId: number | null = null;
  novasMidias: File[] = []; // Renomeado de novasImagens para novasMidias
  // imagensParaRemover: string[] = []; // Esta variável não é mais necessária, a remoção é direta

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
    // Limpa novas mídias e o array de remoção ao cancelar a edição
    if (!this.isEditMode) {
        this.novasMidias = [];
        // Se a remoção de imagem for no frontend antes de salvar, você precisará recarregar o pet.
        this.loadPetData(); // Recarrega os dados originais se cancelar
    }
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
      formData.append('paraAdocao', String(this.pet.paraAdocao)); // Adicionado paraAdoção

      // Adicionar as NOVAS mídias ao FormData
      for (let i = 0; i < this.novasMidias.length; i++) {
        formData.append('imagens', this.novasMidias[i]); // O nome do campo é 'imagens' no backend
      }
      
      // As mídias existentes que NÃO foram removidas já estão no pet.imagens
      // e o backend as preserva ao atualizar, a menos que sejam explicitamente substituídas.
      // A lógica de remoção agora é feita por uma requisição PUT separada.

      this.petService.updatePet(this.petId, formData).subscribe( // updatePet precisa aceitar FormData
        (response) => {
          console.log('Dados do pet atualizados com sucesso!', response);
          alert('Dados do pet atualizados com sucesso!');
          this.isEditMode = false; // Sai do modo de edição
          this.novasMidias = []; // Limpa array de novas mídias
          this.loadPetData(); // Recarrega os dados do pet para mostrar as mídias atualizadas
        },
        (error) => {
          console.error('Erro ao atualizar dados do pet:', error);
          alert('Erro ao atualizar dados do pet!');
        }
      );
    }
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
      this.novasMidias = Array.from(input.files); // Armazena os arquivos selecionados
    }
  }

  // Método para remover uma mídia (imagem ou vídeo) do pet
  removerMidia(mediaUrl: string) { // Renomeado para removerMidia
    if (this.petId !== null) {
      const confirmRemove = confirm('Tem certeza de que deseja remover esta mídia?');
      if (confirmRemove) {
        // Chama o serviço para remover a mídia específica
        this.petService.removerImagem(this.petId, mediaUrl).subscribe( // O nome do serviço é removerImagem
          (petAtualizado) => {
            this.pet.imagens = petAtualizado.imagens; // Atualiza o array de imagens diretamente
            console.log('Mídia removida com sucesso', petAtualizado);
          },
          (erro) => {
            console.error('Erro ao remover a mídia:', erro);
            alert('Erro ao remover a mídia!');
          }
        );
      }
    }
  }

  // --- NOVOS MÉTODOS PARA VERIFICAR TIPO DE MÍDIA ---
  isImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.ico'];
    const ext = this.getFileExtension(url);
    return imageExtensions.includes(ext);
  }

  isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.avi', '.wmv', '.flv'];
    const ext = this.getFileExtension(url);
    return videoExtensions.includes(ext);
  }

  private getFileExtension(url: string): string {
    const lastDotIndex = url.lastIndexOf('.');
    return lastDotIndex !== -1 ? url.substring(lastDotIndex).toLowerCase() : '';
  }
  // ---------------------------------------------------
}