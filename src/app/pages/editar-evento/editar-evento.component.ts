import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService, Evento } from '../../services/evento.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-evento',
  templateUrl: './editar-evento.component.html',
  styleUrls: ['./editar-evento.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class EditarEventoComponent implements OnInit {
  eventos: Evento[] = [];

  constructor(
    private eventoService: EventoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarEventos();
  }

  carregarEventos() {
    this.eventoService.getEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos;
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
      }
    });
  }

  editarEvento(id: number) {
    this.router.navigate(['/editar-evento', id]);
  }
excluirEvento(id: number) {
  if (confirm('Tem certeza que deseja excluir este evento?')) {
    console.log('Tentando excluir evento ID:', id);
    this.eventoService.excluirEvento(id).subscribe({
      next: () => {
        console.log('Evento excluído com sucesso');
        this.carregarEventos();
      },
      error: (error) => {
        console.error('Erro detalhado na exclusão:', error);
        alert('Erro ao excluir evento. Verifique o console para detalhes.');
      }
    });
  }
}
}