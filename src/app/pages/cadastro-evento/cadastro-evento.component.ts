import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // talvez necessário
import { EventoService } from '../../services/evento.service';

@Component({
  standalone: true,
  selector: 'app-cadastro-evento',
  templateUrl: './cadastro-evento.component.html',
  styleUrls: ['./cadastro-evento.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class CadastroEventoComponent {
  eventoForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private router: Router
  ) {
    this.eventoForm = this.fb.group({
      titulo: ['', Validators.required],
      data: ['', Validators.required],
      local: ['', Validators.required],
      descricao: ['', Validators.required],
      ongs: [''],
      imagem: [''],
      contato: [''],
      cep: ['']
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.eventoForm.patchValue({ imagem: file });
    }
  }

onSubmit(): void {
  if (this.eventoForm.valid) {
    const formData = new FormData();
    
    // Converta a data para o formato ISO se necessário
    const rawData = this.eventoForm.getRawValue();
    const eventoData = {
      ...rawData,
      data: new Date(rawData.data).toISOString() // Converte para formato ISO
    };

    // Adiciona todos os campos do formulário ao FormData
    Object.keys(eventoData).forEach(key => {
      if (key !== 'imagem' && eventoData[key] !== null && eventoData[key] !== undefined) {
        formData.append(key, eventoData[key]);
      }
    });

    // Adiciona a imagem separadamente se existir
    if (this.selectedFile) {
      formData.append('imagem', this.selectedFile, this.selectedFile.name);
    }

    this.eventoService.criarEvento(formData).subscribe({
      next: (response) => {
        console.log('Evento criado com sucesso:', response);
        this.router.navigate(['/eventos']);
      },
      error: (error) => {
        console.error('Erro ao criar evento:', error);
        // Adicione aqui tratamento de erro para o usuário
      }
    });
  }
}

  onCancel(): void {
    this.router.navigate(['/eventos']);
  }
}