import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccesoService } from '../../services/acceso.service';
import { ConsultaService } from '../../services/consulta.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegistroComponent {
  registroForm: FormGroup;
  errorMessage: string | null = null; // <--- Adicione esta variável

  constructor(
    private fb: FormBuilder,
    private accesoService: AccesoService,
    private consultaService: ConsultaService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{2}\d{4,5}\d{4}$/)]],
      cep: [''],
      rua: [''],
      bairro: [''],
      cidade: [''],
      estado: ['']
    });
  }

  register() {
    this.errorMessage = null; // <--- Limpa qualquer erro anterior ao tentar registrar

    if (this.registroForm.valid) {
      this.accesoService.register(this.registroForm.value).subscribe(
        (res) => {
          this.router.navigate(['/']); // Supondo que redireciona para a home ou login
        },
        (err) => {
          // <--- Trata o erro e exibe a mensagem específica do backend
          this.errorMessage = err.error.error || 'Ocorreu um erro no registro. Tente novamente.';
          console.error('Erro ao registrar', err);
        }
      );
    } else {
      // Se o formulário não for válido no frontend, mostra um erro genérico
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios e válidos.';
      this.registroForm.markAllAsTouched(); // Para mostrar as validações dos campos
    }
  }

  onCepChange() {
    const cep = this.registroForm.get('cep')?.value;
    if (cep && cep.length === 8) {
      this.consultaService.getCEP(cep).subscribe(data => {
        this.registroForm.patchValue({
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        });
      });
    }
  }
}