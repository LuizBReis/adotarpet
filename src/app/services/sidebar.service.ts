import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // Comportamento padrão da visibilidade da sidebar como visível
  private sidebarVisibilitySubject = new BehaviorSubject<boolean>(true);
  sidebarVisibility$ = this.sidebarVisibilitySubject.asObservable();

  // Método para alternar a visibilidade da sidebar
  toggleSidebar() {
    this.sidebarVisibilitySubject.next(!this.sidebarVisibilitySubject.value);
  }

  // Método para definir a sidebar como visível
  showSidebar() {
    this.sidebarVisibilitySubject.next(true);
  }

  // Método para definir a sidebar como oculta
  hideSidebar() {
    this.sidebarVisibilitySubject.next(false);
  }
}
