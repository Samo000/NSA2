import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterSocialComponent } from './footer-social';

describe('FooterSocial', () => {
  let component: FooterSocialComponent;
  let fixture: ComponentFixture<FooterSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterSocialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
