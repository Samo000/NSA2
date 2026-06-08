import { Component } from '@angular/core';
import { FooterLinksComponent } from './footer-links/footer-links';
import { FooterSocialComponent } from './footer-social/footer-social';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FooterLinksComponent, FooterSocialComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {}
