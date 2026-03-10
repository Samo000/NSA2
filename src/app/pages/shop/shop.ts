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
  selectedCategory = 'all';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating = 0;
  onlyInStock = false;

  products: ProductImage[] = FEATURED_PRODUCTS;

  get categories(): string[] {
    return [...new Set(this.products.map((product) => product.category))].sort((a, b) => a.localeCompare(b));
  }

  filteredProducts(): ProductImage[] {
    const query = this.search.trim().toLowerCase();
    const min = this.normalizePriceInput(this.minPrice);
    const max = this.normalizePriceInput(this.maxPrice);
    const minRating = Number(this.minRating || 0);

    let filtered = this.products.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (this.selectedCategory !== 'all' && product.category !== this.selectedCategory) return false;
      if (this.onlyInStock && product.stock <= 0) return false;
      if (product.rating < minRating) return false;

      const price = this.getPrice(product.price);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;

      return true;
    });

    if (this.sort === 'low') {
      filtered = filtered.sort((a, b) => this.getPrice(a.price) - this.getPrice(b.price));
    }

    if (this.sort === 'high') {
      filtered = filtered.sort((a, b) => this.getPrice(b.price) - this.getPrice(a.price));
    }

    if (this.sort === 'rating') {
      filtered = filtered.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
    }

    return filtered;
  }

  clearFilters(): void {
    this.search = '';
    this.sort = 'default';
    this.selectedCategory = 'all';
    this.minPrice = null;
    this.maxPrice = null;
    this.minRating = 0;
    this.onlyInStock = false;
  }

  private normalizePriceInput(value: number | null): number | null {
    if (!Number.isFinite(value)) return null;
    const normalized = Number(value);
    return normalized >= 0 ? normalized : null;
  }

  private getPrice(price: string): number {
    return Number(price.replace(/[^\d]/g, '')) || 0;
  }
}
