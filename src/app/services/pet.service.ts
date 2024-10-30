import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definir a interface para um Pet
interface Pet {
  id: number;
  nome: string;
  idade: number;
  tipo: string;
  raca: string;
  porte: string;
  castrado: boolean;
  paraAdocao: boolean; // Novo campo para adoção
  donoId: number; // Relacionamento com o Dono
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:3000/api/pets'; // URL da API para os pets

  constructor(private http: HttpClient) {}

  // Método para cadastrar um novo pet
  cadastrarPet(petData: Pet): Observable<any> {
    return this.http.post(`${this.apiUrl}`, petData); // Faz a requisição POST com os dados do pet
  }

  // Método para obter os dados de um pet pelo ID
  getPet(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`); // Faz a requisição GET para obter os dados do pet
  }

  // Método para atualizar os dados de um pet pelo ID
  updatePet(id: number, petData: Pet): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, petData); // Faz a requisição PUT para atualizar o pet
  }

  // Método para excluir um pet pelo ID
  deletePet(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`); // Faz a requisição DELETE para excluir o pet
  }

  // Método para obter todos os pets de um dono específico
// pet.service.ts
  getPetsByDono(donoId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/dono/${donoId}`); // Alterado para a URL correta
}

  // Método para obter todos os pets disponíveis para adoção
  getPetsParaAdocao(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/adocao`); // Faz a requisição GET para listar pets disponíveis para adoção
  }
}
