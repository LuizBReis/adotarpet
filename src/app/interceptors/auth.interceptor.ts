import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccesoService } from '../services/acceso.service'; // Ajuste o caminho se necessário

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private accesoService: AccesoService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.accesoService.getToken();

    // Adiciona o token no cabeçalho Authorization se ele existir
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(request);
  }
}