import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true, // Angular 17 usa standalone components
  imports: [MatToolbarModule, MatIconModule, CommonModule] 
})
export class HeaderComponent  {

  constructor(private sidebarService: SidebarService, private router: Router) {}

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  openProfileMenu() {
    console.log('Opções de perfil');
    this.router.navigate(['/profile']);
  }
}
