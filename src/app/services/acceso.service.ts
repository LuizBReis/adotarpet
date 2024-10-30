import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  token: string;
  id: number; // ID do dono
}

@Injectable({
  providedIn: 'root'
})
export class AccesoService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private donoIdKey = 'donoId';

  constructor(private http: HttpClient) { }

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(response => {
        if (response && response.id) {
          this.setDonoId(response.id); // Armazena o ID do dono
        }
      })
    );
  }

  register(dono: any): Observable<any> {
    return this.http.post('http://localhost:3000/api/donos', dono);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem(this.donoIdKey); // Remove o ID do dono ao fazer logout
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setDonoId(donoId: number): void {
    localStorage.setItem(this.donoIdKey, donoId.toString()); // Armazena o ID do dono
  }

  getDonoId(): number | null {
    const id = localStorage.getItem(this.donoIdKey);
    return id ? Number(id) : null; // Retorna o ID do dono ou null
  }
}
