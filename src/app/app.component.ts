import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet], // Importando CommonModule e RouterOutlet
})
export class AppComponent {
  title = 'petmatch';  // Altere o título para 'petmatch'
}
