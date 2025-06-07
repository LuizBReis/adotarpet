import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService, Evento } from '../../services/evento.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-evento-form',
  templateUrl: './editar-evento-form.component.html',
  styleUrls: ['./editar-evento-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class EditarEventoFormComponent implements OnInit {
  eventoForm: FormGroup;
  eventoId: number;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventoId = Number(this.route.snapshot.params['id']);
    this.eventoForm = this.fb.group({
      titulo: ['', Validators.required],
      data: ['', Validators.required],
      local: ['', Validators.required],
      descricao: ['', Validators.required],
      ongs: [''],
      contato: [''],
      cep: [''],
      imagem: ['']
    });
  }

  ngOnInit() {
    this.carregarEvento();
  }

  carregarEvento() {
    this.eventoService.getEvento(this.eventoId).subscribe({
      next: (evento) => {
        const dataFormatada = new Date(evento.data).toISOString().slice(0, 16);
        this.eventoForm.patchValue({
          ...evento,
          data: dataFormatada
        });
      },
      error: (error) => {
        console.error('Erro ao carregar evento:', error);
      }
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

onSubmit(): void {
  if (this.eventoForm.valid && this.eventoId) {
    const formData = new FormData();
    const formValue = this.eventoForm.value;

    // Adiciona todos os campos exceto imagem
    Object.keys(formValue).forEach(key => {
      if (key !== 'imagem' && formValue[key] !== null && formValue[key] !== undefined) {
        formData.append(key, formValue[key]);
      }
    });

    // Adiciona a imagem se existir
    if (this.selectedFile) {
      formData.append('imagem', this.selectedFile);
    }


    this.eventoService.atualizarEvento(this.eventoId, formData).subscribe({
      next: (response) => {
        console.log('Evento atualizado com sucesso:', response);
        this.router.navigate(['/editar-evento']);
      },
      error: (error) => {
        console.error('Erro detalhado:', error);
        alert('Erro ao atualizar evento. Verifique o console para detalhes.');
      }
    });
  }
}

  cancelar() {
    this.router.navigate(['/editar-evento']);
  }
}