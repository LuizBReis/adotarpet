import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccesoService } from '../../services/acceso.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null; // Propriedade para armazenar mensagem de erro

  constructor(
    private fb: FormBuilder,
    private accesoService: AccesoService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  login() {
    if (this.loginForm.valid) {
      const { email, senha } = this.loginForm.value;
      this.accesoService.login(email, senha).subscribe(
        (res: any) => {
          console.log('Resposta do login:', res); // Verifique a resposta
          localStorage.setItem('token', res.token);
          
          if (res.id) {
            this.accesoService.setDonoId(res.id); // Armazena o ID do dono
            this.router.navigate(['/inicio']);
          } else {
            this.errorMessage = 'Credenciais inválidas. Tente novamente.'; // Mensagem de erro
            console.error('Dono ID não encontrado na resposta');
          }
        },
        (err) => {
          this.errorMessage = 'E-mail ou senha inválidos. Tente novamente.'; // Mensagem de erro
          console.error('Erro ao fazer login', err);
        }
      );
    }
  }

  navigateToRegister() {
    this.router.navigate(['/registro']);
  }
}
