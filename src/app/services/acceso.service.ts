import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  token: string;
  id: number;
  role: string; // <--- Adicione o papel aqui
}

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  exp: number; // Campo de expiração
  iat: number; // Campo de "issued at"
}

@Injectable({
  providedIn: 'root'
})
export class AccesoService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private donoIdKey = 'donoId';
  private donoRoleKey = 'donoRole'; // <--- Nova chave para o papel

  constructor(private http: HttpClient) { }

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(response => {
        if (response && response.token && response.id && response.role) {
          localStorage.setItem('token', response.token);
          this.setDonoId(response.id);
          this.setDonoRole(response.role); // <--- Armazena o papel
        }
      })
    );
  }

  register(dono: any): Observable<any> {
    return this.http.post('http://localhost:3000/api/donos', dono);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, novaSenha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { novaSenha });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem(this.donoIdKey);
    localStorage.removeItem(this.donoRoleKey); // <--- Remove o papel ao fazer logout
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      // Verifica se o token não expirou
      const currentTime = Date.now() / 1000; // Tempo atual em segundos
      return decoded.exp > currentTime;
    } catch (e) {
      return false; // Token inválido ou expirado
    }
  }

  setDonoId(donoId: number): void {
    localStorage.setItem(this.donoIdKey, donoId.toString());
  }

  getDonoId(): number | null {
    const id = localStorage.getItem(this.donoIdKey);
    return id ? Number(id) : null;
  }

  // --- NOVOS MÉTODOS PARA O PAPEL ---
  setDonoRole(role: string): void {
    localStorage.setItem(this.donoRoleKey, role);
  }

  getDonoRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.role;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }

  // Método para verificar se o usuário tem um papel específico
  hasRole(requiredRoles: string[]): boolean {
    const userRole = this.getDonoRole();
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }
  // ----------------------------------
}