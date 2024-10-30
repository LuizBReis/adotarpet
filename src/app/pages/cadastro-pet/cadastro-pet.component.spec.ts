import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CadastroPetComponent } from './cadastro-pet.component';

describe('CadastroPetComponent', () => {
  let component: CadastroPetComponent;
  let fixture: ComponentFixture<CadastroPetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroPetComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when the form is empty', () => {
    expect(component.cadastroPetForm.valid).toBeFalsy();
  });

  it('should be valid when the form is filled', () => {
    component.cadastroPetForm.controls['nome'].setValue('Rex');
    component.cadastroPetForm.controls['idade'].setValue(5);
    component.cadastroPetForm.controls['tipo'].setValue('Cachorro');
    component.cadastroPetForm.controls['raca'].setValue('Labrador');
    component.cadastroPetForm.controls['porte'].setValue('grande'); // Adicionado para garantir que o porte esteja definido
    component.cadastroPetForm.controls['castrado'].setValue(false); // Adicionado para garantir que o castrado esteja definido
    expect(component.cadastroPetForm.valid).toBeTruthy();
  });
});
