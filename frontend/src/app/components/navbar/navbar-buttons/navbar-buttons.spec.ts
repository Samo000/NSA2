import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarButtonsComponent } from './navbar-buttons';

describe('NavbarButtons', () => {
  let component: NavbarButtonsComponent;
  let fixture: ComponentFixture<NavbarButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarButtonsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
