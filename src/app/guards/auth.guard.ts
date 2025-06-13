import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccesoService } from '../services/acceso.service';

export const authGuard: CanActivateFn = (route, state) => {
  const accesoService = inject(AccesoService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[]; // Obtém os papéis da rota

  if (accesoService.isLoggedIn() && accesoService.hasRole(requiredRoles)) {
    return true; // Usuário logado e com o papel necessário
  } else {
    // Redireciona para o login ou uma página de acesso negado
    router.navigate(['/login']); // Ou '/acesso-negado' se tiver
    return false;
  }
};