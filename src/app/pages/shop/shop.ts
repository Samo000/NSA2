import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FEATURED_PRODUCTS, ProductImage } from '../../models/image.model';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class ShopComponent {

  search = '';
  sort = 'default';

  products: ProductImage[] = FEATURED_PRODUCTS;

  filteredProducts(): ProductImage[] {

    let filtered = this.products.filter(p =>
      p.name.toLowerCase().includes(this.search.toLowerCase())
    );

    if (this.sort === 'low') {
      filtered = filtered.sort((a, b) =>
        this.getPrice(a.price) - this.getPrice(b.price)
      );
    }

    if (this.sort === 'high') {
      filtered = filtered.sort((a, b) =>
        this.getPrice(b.price) - this.getPrice(a.price)
      );
    }

    return filtered;
  }

  private getPrice(price: string): number {
    return Number(price.replace(/[^\d]/g, '')) || 0;
  }

}