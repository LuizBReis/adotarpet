import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro-pet',
  templateUrl: './cadastro-pet.component.html',
  styleUrls: ['./cadastro-pet.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CadastroPetComponent {
  cadastroPetForm: FormGroup;
  imagens: File[] = [];  // Array para armazenar várias imagens
  imagemError = false;

  constructor(
    private fb: FormBuilder, 
    private petService: PetService, 
    private accesoService: AccesoService,
    public router: Router,
    private dialog: MatDialog
  ) {
    this.cadastroPetForm = this.fb.group({
      nome: ['', Validators.required],
      idade: ['', [Validators.required, Validators.min(0)]],
      tipo: ['', Validators.required],
      raca: ['', Validators.required],
      porte: ['', Validators.required],
      castrado: [false, Validators.required],
      paraAdocao: [false, Validators.required]
    });
  }

  // Manipular seleção de imagens
  onImagesChange(event: any) {
    this.imagens = Array.from(event.target.files);  // Armazena múltiplas imagens no array
    this.imagemError = this.imagens.length === 0;
  }

  onSubmit() {
    if (this.cadastroPetForm.valid && this.imagens.length > 0) {
      const donoId = this.accesoService.getDonoId();
      if (donoId) {
        const formData = new FormData();
        formData.append('nome', this.cadastroPetForm.value.nome);
        formData.append('idade', this.cadastroPetForm.value.idade);
        formData.append('tipo', this.cadastroPetForm.value.tipo);
        formData.append('raca', this.cadastroPetForm.value.raca);
        formData.append('porte', this.cadastroPetForm.value.porte);
        formData.append('castrado', this.cadastroPetForm.value.castrado ? 'true' : 'false');
        formData.append('paraAdocao', this.cadastroPetForm.value.paraAdocao ? 'true' : 'false');
        formData.append('donoId', donoId.toString());

        // Adiciona cada imagem ao FormData
        this.imagens.forEach((imagem, index) => {
          formData.append('imagens', imagem);
        });

        this.petService.cadastrarPet(formData).subscribe(
          response => {
            console.log('Pet cadastrado com sucesso', response);
            alert('Cadastro realizado com sucesso!');
            this.router.navigate(['/inicio']);
          },
          error => {
            console.error('Erro ao cadastrar pet', error);
          }
        );
      }
    } else {
      this.imagemError = this.imagens.length === 0;
      console.error('Formulário inválido ou nenhuma imagem selecionada.');
    }
  }
}
