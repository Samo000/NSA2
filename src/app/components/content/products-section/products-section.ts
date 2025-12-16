import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductImage, FEATURED_PRODUCTS } from '../../../models/image.model';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products-section.html',
  styleUrl: './products-section.scss'
})
export class ProductsSectionComponent {
  products: ProductImage[] = FEATURED_PRODUCTS;
}
