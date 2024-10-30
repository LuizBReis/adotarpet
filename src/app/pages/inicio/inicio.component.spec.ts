import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InicioComponent } from './inicio.component';

describe('InicioComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule], // Importe o módulo de animações
      declarations: [InicioComponent], // Ou imports se for standalone
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InicioComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
