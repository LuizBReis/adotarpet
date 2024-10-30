import { Component } from '@angular/core';
import { SidebarService } from '../services/sidebar.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../layout/header/header.component';
import { SidebarComponent } from '../layout/sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true, // Angular 17 usa standalone components
  imports: [MatToolbarModule, MatIconModule, CommonModule, HeaderComponent, SidebarComponent, RouterOutlet] 
})
export class MainComponent {

  isSidebarVisible = true;
  constructor(private sidebarService: SidebarService) {}


  ngOnInit() {
    this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidebarVisible = isVisible;
    });
  }


}
