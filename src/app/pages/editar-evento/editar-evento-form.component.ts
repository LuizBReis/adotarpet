import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService, Evento } from '../../services/evento.service'; // Use Evento do seu serviço
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

@Component({
  selector: 'app-editar-evento-form',
  templateUrl: './editar-evento-form.component.html',
  styleUrls: ['./editar-evento-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, SidebarComponent]
})
export class EditarEventoFormComponent implements OnInit {
  eventoForm: FormGroup;
  eventoId: number;
  evento: Evento | null = null; // Armazena os dados do evento carregado
  novasMidias: File[] = []; // Array para as novas mídias selecionadas
  selectedFileNames: string = 'Nenhum arquivo selecionado'; // Para exibir nomes de arquivos no input
  mediaPreviews: { url: string, type: 'image' | 'video' }[] = []; // Para pré-visualizações
  midiasParaRemover: string[] = []; // Essa lista não será usada para o PUT, mas para o delete direto.

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
    });
  }

  ngOnInit() {
    this.carregarEvento();
  }

  carregarEvento() {
    // CORRIGIDO: Convertendo this.eventoId para string antes de passar, se getEventoPorId espera string.
    // Pelo seu EventoService anterior, getEventoPorId aceita number | string.
    // Então, a chamada original deve estar OK, mas vamos forçar para string para garantir
    // que não haja erro de inferência em alguma parte do ambiente.
    this.eventoService.getEventoPorId(String(this.eventoId)).subscribe({ // <--- CORRIGIDO AQUI!
      next: (evento) => {
        this.evento = evento; // Armazena o evento completo
        // Formata a data para o input datetime-local
        const dataFormatada = new Date(evento.data).toISOString().slice(0, 16);
        this.eventoForm.patchValue({
          titulo: evento.titulo,
          data: dataFormatada,
          local: evento.local,
          descricao: evento.descricao,
          ongs: evento.ongs,
          contato: evento.contato,
          cep: evento.cep,
        });
      },
      error: (error) => {
        console.error('Erro ao carregar evento:', error);
        alert('Erro ao carregar evento. Verifique o console.');
        this.router.navigate(['/editar-evento']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.novasMidias = Array.from(input.files);
      this.selectedFileNames = this.novasMidias.map(file => file.name).join(', ');

      this.mediaPreviews = [];
      this.novasMidias.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const fileType = file.type.startsWith('image/') ? 'image' : 'video';
          this.mediaPreviews.push({ url: reader.result as string, type: fileType });
        };
        reader.readAsDataURL(file);
      });
    } else {
      this.novasMidias = [];
      this.selectedFileNames = 'Nenhum arquivo selecionado';
      this.mediaPreviews = [];
    }
  }

  removerMidiaExistente(mediaUrl: string): void {
    if (this.evento && this.evento.imagens) {
      const confirmRemove = confirm('Tem certeza que deseja remover esta mídia?');
      if (confirmRemove) {
        // Remove do array localmente (para refletir na UI imediatamente)
        this.evento.imagens = this.evento.imagens.filter(img => img !== mediaUrl);
        // A lista midiasParaRemover não é usada no PUT, a remoção é direta via serviço.

        // Chame o serviço para remover do backend imediatamente
        this.eventoService.removerImagemEvento(this.eventoId, mediaUrl).subscribe({
          next: (response) => {
            console.log('Mídia removida do backend com sucesso:', response);
          },
          error: (error) => {
            console.error('Erro ao remover mídia do backend:', error);
            alert('Erro ao remover mídia. Tente novamente.');
            this.carregarEvento(); // Recarregar para restaurar se a remoção falhou
          }
        });
      }
    }
  }

  onSubmit(): void {
    if (this.eventoForm.valid && this.eventoId) {
      const formData = new FormData();
      const formValue = this.eventoForm.getRawValue();

      if (formValue.data) {
          formValue.data = new Date(formValue.data).toISOString();
      }

      Object.keys(formValue).forEach(key => {
        if (key !== 'imagem' && formValue[key] !== null && formValue[key] !== undefined) {
          formData.append(key, formValue[key]);
        }
      });

      this.novasMidias.forEach(file => {
        formData.append('imagem', file, file.name);
      });

      this.eventoService.atualizarEvento(this.eventoId, formData).subscribe({
        next: (response) => {
          console.log('Evento atualizado com sucesso:', response);
          alert('Evento atualizado com sucesso!');
          this.router.navigate(['/editar-evento']);
          this.novasMidias = [];
          this.selectedFileNames = 'Nenhum arquivo selecionado';
          this.mediaPreviews = [];
        },
        error: (error) => {
          console.error('Erro detalhado:', error);
          alert('Erro ao atualizar evento. Verifique o console para detalhes.');
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/editar-evento']);
  }

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
}