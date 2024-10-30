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
      paraAdocao: [false, Validators.required] // Adicionando o campo para adoção aqui
    });
  }

  onSubmit() {
    if (this.cadastroPetForm.valid) {
      const donoId = this.accesoService.getDonoId();
      console.log('ID do Dono:', donoId);
      if (donoId) {
        const petData = {
          ...this.cadastroPetForm.value,
          donoId: donoId
        };
        //petData.castrado = petData.castrado;
        // Log para verificação
        console.log('Dados do Pet a serem enviados:', petData);

        this.petService.cadastrarPet(petData).subscribe(
          response => {
            console.log('Pet cadastrado com sucesso', response);
            alert('Cadastro realizado com sucesso!');
            this.router.navigate(['/inicio']);
          },
          error => {
            console.error('Erro ao cadastrar pet', error);
          }
        );
      } else {
        console.error('ID do dono não encontrado.');
      }
    } else {
      console.error('Formulário inválido:', this.cadastroPetForm.errors);
    }
  }
}
