import { Component } from '@angular/core';
import { HeroSectionComponent } from './hero-section/hero-section';
import { ProductsSectionComponent } from './products-section/products-section';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [HeroSectionComponent, ProductsSectionComponent],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class ContentComponent {}
