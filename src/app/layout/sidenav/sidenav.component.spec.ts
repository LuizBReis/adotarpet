import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidenav.component'; // Caminho relativo correto


describe('SidenavComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent]
    });
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
