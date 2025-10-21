import { Component } from '@angular/core';
import { FooterLinksComponent } from './footer-links/footer-links';
import { FooterSocialComponent } from './footer-social/footer-social';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FooterLinksComponent, FooterSocialComponent],
  templateUrl: './footer.html'
})
export class FooterComponent {
  year = new Date().getFullYear();
}
