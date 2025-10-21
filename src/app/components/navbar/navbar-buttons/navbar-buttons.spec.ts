import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarButtons } from './navbar-buttons';

describe('NavbarButtons', () => {
  let component: NavbarButtons;
  let fixture: ComponentFixture<NavbarButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarButtons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarButtons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
