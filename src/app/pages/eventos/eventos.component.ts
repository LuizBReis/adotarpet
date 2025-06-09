import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService, Evento } from '../../services/evento.service';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

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
      (eventos) => {
        this.eventos = eventos.map(evento => ({
          ...evento,
          // Formata a data para exibição
          data: this.formatarData(evento.data),
          // Adiciona horas padrão se não existirem
          horaInicio: evento.horaInicio || '00:00',
          horaFim: evento.horaFim || '00:00'
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

verDetalhes(evento: Evento) {
  console.log('Evento clicado:', evento);
  this.router.navigate(['/evento', evento.id]);
}


}