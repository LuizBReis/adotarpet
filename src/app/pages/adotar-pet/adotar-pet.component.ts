import { Component, OnInit } from '@angular/core';
import { PetService } from '../../services/pet.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

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
}

@Component({
  selector: 'app-adotar-pet',
  templateUrl: './adotar-pet.component.html',
  styleUrls: ['./adotar-pet.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AdotarPetComponent implements OnInit {
  petsParaAdocao: Pet[] = [];

  constructor(
    private petService: PetService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.carregarPetsParaAdocao();
  }

  carregarPetsParaAdocao() {
    this.petService.getPetsParaAdocao().subscribe(
      (pets) => {
        this.petsParaAdocao = pets.filter((pet) => pet.paraAdocao);
      },
      (error) => {
        console.error('Erro ao carregar pets para adoção', error);
      }
    );
  }

  confirmarAdocao(pet: Pet) {
    const confirmacao = window.confirm(`Tem certeza que deseja adotar o pet ${pet.nome}?`);
    if (confirmacao) {
      alert(`Parabéns pela adoção de ${pet.nome}!`);
    }
  }
}
