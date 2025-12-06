import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FOOTER_LINKS, Link } from '../../../models/link.model';

@Component({
  selector: 'app-footer-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-links.html',
  styleUrl: './footer-links.scss'
})
export class FooterLinksComponent {
  links: Link[] = FOOTER_LINKS;
}
