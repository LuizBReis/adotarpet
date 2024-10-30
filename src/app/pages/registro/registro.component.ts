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
  styleUrls: ['./registro.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accesoService: AccesoService,
    private consultaService: ConsultaService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
      cep: [''],
      rua: [''],
      bairro: [''],
      cidade: [''],
      estado: ['']
    });
  }

  register() {
    if (this.registroForm.valid) {
      this.accesoService.register(this.registroForm.value).subscribe(
        (res) => {
          this.router.navigate(['/']);
        },
        (err) => {
          console.error('Erro ao registrar', err);
        }
      );
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
