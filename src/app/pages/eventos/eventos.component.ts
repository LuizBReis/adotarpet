import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../services/evento.service'; // Certifique-se que EventoService existe
import { CommonModule, DatePipe } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

// --- Interface Evento CORRIGIDA ---
export interface Evento {
  id?: number; // <--- AGORA PODE SER UNDEFINED
  titulo: string;
  descricao: string;
  data: string;
  hora_inicio?: string; // <--- CORRIGIDO PARA HORA_INICIO (COM UNDERSCORE)
  hora_fim?: string;    // <--- CORRIGIDO PARA HORA_FIM (COM UNDERSCORE)
  local?: string;
  ongs?: string;
  imagens?: string[]; // Mantém como array de strings
  cep?: string;
  imagemAtual?: number; // Para controle do carrossel
}
// ----------------------------------

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  providers: [DatePipe]
})
export class EventosComponent implements OnInit {
  eventos: Evento[] = [];

  constructor(
    private eventoService: EventoService,
    public router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.carregarEventos();
  }

  carregarEventos() {
    this.eventoService.getEventos().subscribe(
      (eventosBackend: any[]) => { // <--- RECEBE COMO 'any[]' PARA FLEXIBILIDADE INICIAL
        this.eventos = eventosBackend.map(evento => ({
          ...evento, // Copia todas as propriedades do evento do backend
          id: evento.id, // Garante que o id seja copiado, caso não seja o primeiro
          data: this.formatarData(evento.data),
          // Acessa as propriedades com underscore, como vêm do BD
          hora_inicio: evento.hora_inicio || '00:00',
          hora_fim: evento.hora_fim || '00:00',
          imagens: evento.imagens || [], // Garante que 'imagens' é um array, mesmo se vier null
          imagemAtual: 0 // Inicializa o índice da mídia atual
        }));
      },
      (error) => {
        console.error('Erro ao carregar eventos', error);
      }
    );
  }

  private formatarData(dataString: string): string {
    const data = new Date(dataString);
    return this.datePipe.transform(data, 'dd/MM/yyyy') || '';
  }

  // Métodos isImage, isVideo, getFileExtension (sem alterações, mas certifique-se que estão presentes)
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

  // Métodos de navegação de mídia (carrossel)
  anteriorMidia(evento: Evento) {
    if (evento.imagens && evento.imagemAtual !== undefined && evento.imagemAtual > 0) {
      evento.imagemAtual--;
    }
  }

  proximaMidia(evento: Evento) {
    if (evento.imagens && evento.imagemAtual !== undefined && evento.imagemAtual < evento.imagens.length - 1) {
      evento.imagemAtual++;
    }
  }

  verDetalhes(evento: Evento) {
    console.log('Evento clicado:', evento);
    this.router.navigate(['/evento', evento.id]);
  }
}