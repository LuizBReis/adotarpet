import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';


// Definir a interface para um Pet
interface Pet {
  id: number;
  nome: string;
  idade: number;
  tipo: string;
  raca: string;
  porte: string;
  castrado: boolean;
  paraAdocao: boolean;
  donoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:3000/api/pets'; // URL da API para os pets

  constructor(private http: HttpClient) {}

  // Método para cadastrar um novo pet
  cadastrarPet(petData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, petData); // Faz a requisição POST com os dados do pet
  }

  // Método para obter os dados de um pet pelo ID (incluindo o telefone do dono)
  getPet(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`); // Faz a requisição GET para obter os dados do pet, incluindo telefone do dono
  }

  // Método para atualizar os dados de um pet pelo ID
updatePet(id: number, petData: FormData): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, petData); // Faz a requisição PUT com os dados de FormData
}

  // Atualizar o método para remover a imagem e recarregar o pet atualizado
removerImagem(id: number, imagemUrl: string): Observable<any> {
  // Primeiro remove a imagem
  return this.http.put(`${this.apiUrl}/${id}/remover-imagem`, { imagemUrl }).pipe(
    // Após a remoção, fazemos a requisição GET para obter os dados atualizados
    switchMap(() => this.http.get<any>(`${this.apiUrl}/${id}`))
  );
}


  // Método para excluir um pet pelo ID
  deletePet(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`); // Faz a requisição DELETE para excluir o pet
  }

  // Método para obter todos os pets de um dono específico
  getPetsByDono(donoId: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/dono/${donoId}`); // Alterado para a URL correta
  }

  // Método para obter todos os pets disponíveis para adoção
  getPetsParaAdocao(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/adocao`); // Faz a requisição GET para listar pets disponíveis para adoção
  }
}
