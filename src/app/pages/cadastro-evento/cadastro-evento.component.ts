import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventoService } from '../../services/evento.service'; // Certifique-se que EventoService existe
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

@Component({
  standalone: true,
  selector: 'app-cadastro-evento',
  templateUrl: './cadastro-evento.component.html',
  styleUrls: ['./cadastro-evento.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, SidebarComponent]
})
export class CadastroEventoComponent {
  eventoForm: FormGroup;
  selectedFiles: File[] = []; // <--- Alterado para array de arquivos
  selectedFileNames: string = 'Nenhum arquivo selecionado'; // <--- Para exibir nomes de arquivos
  mediaPreviews: { url: string, type: 'image' | 'video' }[] = []; // <--- Para pré-visualizações

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
      // 'imagem' não terá um FormControl para o File em si, será tratado manualmente no onSubmit
      contato: [''],
      cep: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files); // Converte FileList para Array
      this.selectedFileNames = this.selectedFiles.map(file => file.name).join(', '); // Exibe todos os nomes

      // Gera pré-visualizações
      this.mediaPreviews = [];
      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const fileType = file.type.startsWith('image/') ? 'image' : 'video';
          this.mediaPreviews.push({ url: reader.result as string, type: fileType });
        };
        reader.readAsDataURL(file);
      });
    } else {
      this.selectedFiles = [];
      this.selectedFileNames = 'Nenhum arquivo selecionado';
      this.mediaPreviews = [];
    }
  }

  onSubmit(): void {
    if (this.eventoForm.valid) {
      const formData = new FormData();
      
      const rawData = this.eventoForm.getRawValue();
      const eventoData = {
        ...rawData,
        data: new Date(rawData.data).toISOString() // Converte para formato ISO
      };

      Object.keys(eventoData).forEach(key => {
        // Não adiciona 'imagem' diretamente aqui, pois vamos adicionar os arquivos File
        if (key !== 'imagem' && eventoData[key] !== null && eventoData[key] !== undefined) {
          formData.append(key, eventoData[key]);
        }
      });

      // Adiciona múltiplos arquivos ao FormData
      this.selectedFiles.forEach(file => {
        formData.append('imagem', file, file.name); // <--- O nome do campo é 'imagem'
      });

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