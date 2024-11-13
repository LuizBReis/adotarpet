import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PetService } from '../../services/pet.service';
import { AccesoService } from '../../services/acceso.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Importando CommonModule

@Component({
  selector: 'app-cadastro-pet',
  templateUrl: './cadastro-pet.component.html',
  styleUrls: ['./cadastro-pet.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule] // Incluindo tanto ReactiveFormsModule quanto CommonModule
})
export class CadastroPetComponent {
  cadastroPetForm: FormGroup;
  imagem: File | null = null;
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

  // Manipular seleção de imagem
  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagem = file;
      this.imagemError = false;
    }
  }

  onSubmit() {
    if (this.cadastroPetForm.valid && this.imagem) {
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
        formData.append('imagem', this.imagem);  // Aqui você envia o arquivo de imagem

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
      this.imagemError = !this.imagem;
      console.error('Formulário inválido ou imagem não selecionada.');
    }
  }
}
