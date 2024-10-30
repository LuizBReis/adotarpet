import { Component } from '@angular/core';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';
import { HeaderComponent } from '../../layout/header/header.component';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  standalone: true,
  imports: [SidebarComponent, HeaderComponent] // Importa o SidebarComponent
})
export class InicioComponent {}
