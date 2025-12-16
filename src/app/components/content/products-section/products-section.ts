import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImage, FEATURED_PRODUCTS } from '../../../models/image.model';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-section.html',
  styleUrl: './products-section.scss'
})
export class ProductsSectionComponent {
  products: ProductImage[] = FEATURED_PRODUCTS;
  selected: ProductImage | null = null;

  open(product: ProductImage) {
    this.selected = product;
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.selected = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.selected) this.close();
  }
}
