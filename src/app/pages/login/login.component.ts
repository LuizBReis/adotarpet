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
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accesoService: AccesoService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required], // Removi Validators.email para simplificar
      senha: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.valid) {
      const { email, senha } = this.loginForm.value;
      this.accesoService.login(email, senha).subscribe(
        (res: any) => {
          console.log('Resposta do login:', res);
          localStorage.setItem('token', res.token);
          
          if (res.id) {
            this.accesoService.setDonoId(res.id);
            this.router.navigate(['/inicio']);
          } else {
            this.errorMessage = 'CREDENCIAIS INVÁLIDAS. TENTE NOVAMENTE.';
            console.error('Dono ID não encontrado na resposta');
          }
        },
        (err) => {
          this.errorMessage = 'EMAIL OU SENHA INVÁLIDOS. TENTE NOVAMENTE.';
          console.error('Erro ao fazer login', err);
        }
      );
    } else {
      // Não exibe erros locais, apenas submete para a API
      this.loginForm.markAllAsTouched(); // Garante que o formulário seja considerado inválido
    }
  }

  navigateToRegister() {
    this.router.navigate(['/registro']);
  }
}