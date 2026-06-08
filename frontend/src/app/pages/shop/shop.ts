import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductImage } from '../../models/image.model';
import { ProductCatalogService } from '../../services/product-catalog.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class ShopComponent implements OnInit, OnDestroy {
  private readonly catalog = inject(ProductCatalogService);
  private readonly cdr = inject(ChangeDetectorRef);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private searchValue = '';

  debouncedSearch = '';
  sort = 'default';
  selectedCategory = 'all';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minRating = 0;
  onlyInStock = false;

  get products(): ProductImage[] {
    return this.catalog.products();
  }

  get search(): string {
    return this.searchValue;
  }

  set search(value: string) {
    this.searchValue = value;

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.debouncedSearch = this.searchValue.trim();
      this.cdr.markForCheck();
    }, 250);
  }

  ngOnInit(): void {
    void this.catalog.load().finally(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  get categories(): string[] {
    return [...new Set(this.products.map((product) => product.category))].sort((a, b) => a.localeCompare(b));
  }

  filteredProducts(): ProductImage[] {
    const query = this.debouncedSearch.trim();
    const min = this.normalizePriceInput(this.minPrice);
    const max = this.normalizePriceInput(this.maxPrice);
    const minRating = Number(this.minRating || 0);

    let filtered = this.products.filter((product) => {
      if (query && this.fuzzyScore(this.searchText(product), query) <= 0) return false;
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
    this.debouncedSearch = '';
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

  private searchText(product: ProductImage): string {
    return [product.name, product.category, product.price, ...product.specs].join(' ').toLowerCase();
  }

  private fuzzyScore(source: string, input: string): number {
    const target = source.toLowerCase();
    const query = input.trim().toLowerCase();
    if (!query) return 1;
    if (target.includes(query)) return 100 + query.length;

    let score = 0;
    let targetIndex = 0;
    let streak = 0;

    for (const char of query) {
      const found = target.indexOf(char, targetIndex);
      if (found === -1) return 0;

      streak = found === targetIndex ? streak + 1 : 1;
      score += 4 + streak * 2 - Math.min(found - targetIndex, 8);
      targetIndex = found + 1;
    }

    return score;
  }
}
