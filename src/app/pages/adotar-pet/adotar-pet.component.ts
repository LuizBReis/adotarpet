import { Component, OnInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

interface Pet {
  id: number;
  nome: string;
  idade: number;
  tipo: string;
  raca: string;
  porte: string;
  castrado: boolean;
  paraAdocao: boolean;
  donoId: number;
  telefoneDono?: string;
  imagens?: string[]; // Mantenha o nome 'imagens'
  imagemAtual?: number;
}

@Component({
  selector: 'app-adotar-pet',
  templateUrl: './adotar-pet.component.html',
  styleUrls: ['./adotar-pet.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent]
})
export class AdotarPetComponent implements OnInit {

  petsParaAdocao: Pet[] = [];

  constructor(
    private petService: PetService,
    public router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.carregarPetsParaAdocao();
  }

  carregarPetsParaAdocao() {
    this.petService.getPetsParaAdocao().subscribe(
      (pets) => {
        this.petsParaAdocao = pets.filter((pet) => pet.paraAdocao);
        this.petsParaAdocao.forEach(pet => {
          pet.imagemAtual = pet.imagemAtual ?? 0;
          pet.imagens = pet.imagens || [];
        });
      },
      (error) => {
        console.error('Erro ao carregar pets para adoção', error);
      }
    );
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

// Dentro de AdotarPetComponent ou em um utilitário
private getFileExtension(url: string): string {
    const lastDotIndex = url.lastIndexOf('.');
    return lastDotIndex !== -1 ? url.substring(lastDotIndex).toLowerCase() : '';
}
  // ---------------------------------------------------

  anteriorImagem(pet: Pet) {
    if (pet.imagens && pet.imagemAtual !== undefined && pet.imagemAtual > 0) {
      pet.imagemAtual--;
    }
  }

  proximaImagem(pet: Pet) {
    if (pet.imagens && pet.imagemAtual !== undefined && pet.imagemAtual < pet.imagens.length - 1) {
      pet.imagemAtual++;
    }
  }

  abrirWhatsapp(pet: Pet) {
    const telefoneDono = pet.telefoneDono || '';
    const mensagem = `Olá! Tenho interesse em adotar o ${pet.nome}. Ainda está disponível?`;
    const urlWhatsapp = `https://wa.me/${telefoneDono}?text=${encodeURIComponent(mensagem)}`;

    window.open(urlWhatsapp, '_blank');
  }
}