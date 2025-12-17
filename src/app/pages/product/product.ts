import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductImage, FEATURED_PRODUCTS } from '../../models/image.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductPageComponent {
  all: ProductImage[] = FEATURED_PRODUCTS;
  slug = signal<string>('');

  product = computed<ProductImage | null>(() => {
    const s = this.slug();
    return this.all.find(p => p.slug === s) ?? null;
  });

  constructor(route: ActivatedRoute, public cart: CartService) {
    route.paramMap.subscribe(p => this.slug.set(p.get('slug') ?? ''));
  }

  add(p: ProductImage) {
    this.cart.addProduct(p, 1);
  }
}
