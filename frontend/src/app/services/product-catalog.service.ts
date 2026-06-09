import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FEATURED_PRODUCTS, ProductImage } from '../models/image.model';
import { injectApiBaseUrl } from './api-base';

type ApiProduct = {
  _id?: string;
  name?: string;
  slug?: string;
  category?: string;
  price?: number;
  discountPercent?: number;
  showDiscountBadge?: boolean;
  stock?: number;
  description?: string;
  image?: string;
  modelFile?: string;
  specs?: string[];
  rating?: number;
  ratingCount?: number;
};

@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  private readonly http = inject(HttpClient);
  private readonly api = `${injectApiBaseUrl()}/products`;
  private readonly featuredOrder = [
    'gaming-laptop',
    'keyboard',
    'monitor',
    'mouse',
    'headset',
    'chair',
    'desk',
    'microphone',
    'webcam'
  ];
  private loading = false;
  private loaded = false;

  readonly products = signal<ProductImage[]>([]);
  readonly knownSlugs = computed(() => new Set(this.products().map((product) => product.slug)));

  async load(): Promise<void> {
    if (this.loading || this.loaded) return;

    this.loading = true;

    try {
      const products = await firstValueFrom(this.http.get<ApiProduct[]>(this.api));
      const mapped = (Array.isArray(products) ? products : [])
        .map((item) => this.withLocalModelFallback(this.toProductImage(item)))
        .sort((a, b) => this.catalogOrder(a) - this.catalogOrder(b) || a.name.localeCompare(b.name));

      this.products.set(mapped.length ? mapped : FEATURED_PRODUCTS);
      this.loaded = true;
    } catch {
      this.products.set(FEATURED_PRODUCTS);
    } finally {
      this.loading = false;
    }
  }

  async loadOne(slug: string): Promise<ProductImage | null> {
    await this.load();
    const existing = this.products().find((product) => product.slug === slug);
    if (existing) return existing;

    try {
      const product = await firstValueFrom(this.http.get<ApiProduct>(`${this.api}/${slug}`));
      const mapped = this.withLocalModelFallback(this.toProductImage(product));
      this.products.update((items) => (items.some((item) => item.slug === mapped.slug) ? items : [mapped, ...items]));
      return mapped;
    } catch {
      return null;
    }
  }

  private toProductImage(product: ApiProduct): ProductImage {
    const name = String(product.name || 'Untitled product');
    const price = Number(product.price || 0);
    const discountPercent = Math.max(0, Math.min(95, Math.floor(Number(product.discountPercent || 0))));
    const salePrice = discountPercent > 0 ? Math.round(price * (100 - discountPercent)) / 100 : price;
    const slug = String(product.slug || product._id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');

    return {
      src: this.normalizeImagePath(product.image),
      modelFile: this.normalizeOptionalAssetPath(product.modelFile),
      alt: name,
      name,
      price: this.formatEUR(salePrice),
      originalPrice: discountPercent > 0 ? this.formatEUR(price) : undefined,
      slug,
      specs: Array.isArray(product.specs) ? product.specs : [],
      category: String(product.category || 'Izdelki'),
      rating: Number(product.rating || 0),
      ratingCount: Number(product.ratingCount || 0),
      stock: Number(product.stock || 0),
      discountPercent,
      showDiscountBadge: Boolean(product.showDiscountBadge) && discountPercent > 0
    };
  }

  private formatEUR(value: number): string {
    return `${Math.max(0, Math.round(value)).toLocaleString('sl-SI')} EUR`;
  }

  private normalizeImagePath(value: unknown): string {
    const path = String(value || '/assets/laptop.jpg').trim();
    if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }

  private normalizeOptionalAssetPath(value: unknown): string | undefined {
    const path = String(value || '').trim();
    if (!path) return undefined;
    if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
    return path.startsWith('/') ? path : `/${path}`;
  }

  private withLocalModelFallback(product: ProductImage): ProductImage {
    if (product.modelFile) return product;

    const local = FEATURED_PRODUCTS.find((item) => item.slug === product.slug);
    return local?.modelFile ? { ...product, modelFile: local.modelFile } : product;
  }

  private catalogOrder(product: ProductImage): number {
    const index = this.featuredOrder.indexOf(product.slug);
    return index >= 0 ? index : this.featuredOrder.length + 1;
  }
}
