import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // O serviço já é registrado automaticamente
})
export class AccesoService {
  private apiUrl = 'http://localhost:3000/api/auth'; // A URL da sua API de autenticação

  constructor(private http: HttpClient) { }

  login(email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, senha });
  }

  register(dono: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dono); // Atualize a URL do endpoint de registro
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
