import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccesoService } from '../../services/acceso.service'; // Seu serviço de acesso
import { Router } from '@angular/router'; // Para navegação
import { HttpClient } from '@angular/common/http'; // Para fazer requisições HTTP diretamente a donos
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidenav/sidenav.component';

interface Dono {
  id: number;
  nome: string;
  email: string;
  role: string;
  // Inclua outros campos relevantes se quiser exibi-los
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'], // ou .css se você não usa scss
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, SidebarComponent]
})
export class UserManagementComponent implements OnInit {
  donos: Dono[] = [];
  selectedDono: Dono | null = null;
  editUserForm: FormGroup;
  message: string | null = null;
  errorMessage: string | null = null;
  loading: boolean = true;

  roles: string[] = ['comum', 'ong', 'admin']; // Papéis disponíveis

  constructor(
    private fb: FormBuilder,
    private accesoService: AccesoService,
    private router: Router,
    private http: HttpClient // Injetar HttpClient para operações diretas em /api/donos
  ) {
    this.editUserForm = this.fb.group({
      nome: [{ value: '', disabled: true }], // Nome será apenas para exibição
      email: [{ value: '', disabled: true }], // Email será apenas para exibição
      role: ['', Validators.required]
    });
  }

ngOnInit(): void {
  console.log('UserManagementComponent carregado!'); // <--- Adicione esta linha
  this.loadDonos();
}
  loadDonos(): void {
    this.loading = true;
    this.errorMessage = null;
    this.message = null;
    console.log('Carregando donos...');

    // Fazer requisição para listar todos os donos (rota protegida no backend)
    // O AccesoService não tem um método para pegar todos os donos, então usamos o HttpClient direto
    // Você pode adicionar um método getAllDonos no AccesoService se preferir
    this.http.get<Dono[]>('http://localhost:3000/api/donos').subscribe({
      next: (data) => {
        this.donos = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao carregar usuários: ' + (err.error.error || 'Erro desconhecido');
        this.loading = false;
        console.error('Erro ao carregar donos:', err);
        // Se for erro 403 (Forbidden), pode ser que o usuário não seja admin, redirecione para login
        if (err.status === 403 || err.status === 401) {
          this.accesoService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  selectDono(dono: Dono): void {
    this.selectedDono = dono;
    this.message = null;
    this.errorMessage = null;
    this.editUserForm.patchValue({
      nome: dono.nome,
      email: dono.email,
      role: dono.role
    });
  }

  saveRole(): void {
    this.errorMessage = null;
    this.message = null;

    if (this.editUserForm.valid && this.selectedDono) {
      const newRole = this.editUserForm.get('role')?.value;

      // Impede o admin de alterar o próprio papel para algo diferente de 'admin'
      // ou de desativar o próprio papel de admin
      if (this.selectedDono.id === this.accesoService.getDonoId() && newRole !== 'admin') {
          this.errorMessage = 'Você não pode rebaixar seu próprio papel de administrador.';
          return;
      }

      // Fazer requisição PUT para atualizar o papel do usuário no backend
      // O AccesoService não tem um método para atualizar dono, então usamos o HttpClient direto
      this.http.put(`http://localhost:3000/api/donos/${this.selectedDono.id}`, { role: newRole }).subscribe({
        next: (response) => {
          this.message = 'Papel atualizado com sucesso!';
          this.loadDonos(); // Recarrega a lista para ver a mudança
          this.selectedDono = null; // Fecha o formulário de edição
        },
        error: (err) => {
          this.errorMessage = 'Erro ao atualizar papel: ' + (err.error.error || 'Erro desconhecido');
          console.error('Erro ao atualizar papel do dono:', err);
        }
      });
    } else {
      this.errorMessage = 'Por favor, selecione um papel válido.';
    }
  }

  cancelEdit(): void {
    this.selectedDono = null;
    this.message = null;
    this.errorMessage = null;
    this.editUserForm.reset();
  }
}