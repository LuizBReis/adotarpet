import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evento {
  horaInicio: string;
  horaFim: string;
  id?: number;
  titulo: string;
  descricao: string;
  data: string;
  local: string;
  imagem?: string;
  ongs?: string;
  cep?: string;
  contato?: string;
}

@Injectable({ providedIn: 'root' })
export class EventoService {
  private apiUrl = 'http://localhost:3000/api/eventos';

  constructor(private http: HttpClient) {}

  // Cria novo evento
  criarEvento(eventoData: FormData): Observable<Evento> {
    return this.http.post<Evento>(this.apiUrl, eventoData);
  }

  atualizarEvento(id: number, eventoData: FormData): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, eventoData, {
      headers: {
        // Adicione headers se necessário
        'Accept': 'application/json'
      }
    });
  }
  // Exclui evento
  excluirEvento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'json'
    });
  }

  // Obtém todos os eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  // Obtém um evento por ID (number)
  getEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  // Obtém um evento por ID (string)
  getEventoPorId(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }
}