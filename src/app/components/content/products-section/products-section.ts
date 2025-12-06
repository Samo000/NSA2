import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FEATURED_PRODUCTS, ProductImage } from '../../../models/image.model';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-section.html',
  styleUrl: './products-section.scss'
})
export class ProductsSectionComponent {
  products: ProductImage[] = FEATURED_PRODUCTS;
}
