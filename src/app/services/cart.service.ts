import { Injectable, computed, inject, signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ProductImage } from '../models/image.model';

export type CartItem = {
  slug: string;
  name: string;
  price: string;
  src: string;
  qty: number;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly key = 'techmarket_cart_v1';
  private readonly couponKey = 'techmarket_cart_coupon_v1';

  items = signal<CartItem[]>(this.readItems());
  coupon = signal<string>(this.readCoupon());

  subtotal = computed(() =>
    this.items().reduce((a, it) => a + this.priceToNumber(it.price) * it.qty, 0)
  );

  discountRate = computed(() => (this.coupon().toLowerCase().trim() === 'koren5' ? 0.05 : 0));
  discountAmount = computed(() => Math.round(this.subtotal() * this.discountRate()));
  total = computed(() => this.subtotal() - this.discountAmount());

  addProduct(p: ProductImage, qty = 1): void {
    const list = this.items().slice();
    const i = list.findIndex(x => x.slug === p.slug);

    if (i >= 0) {
      list[i] = { ...list[i], qty: Math.min(99, list[i].qty + qty) };
    } else {
      list.unshift({
        slug: p.slug,
        name: p.name,
        price: p.price,
        src: p.src,
        qty: Math.max(1, qty)
      });
    }

    this.items.set(list);
    this.persistItems();
  }

  remove(slug: string): void {
    this.items.set(this.items().filter(x => x.slug !== slug));
    this.persistItems();
  }

  setQty(slug: string, qty: number): void {
    const q = Math.max(1, Math.min(99, Math.floor(qty || 1)));
    this.items.set(this.items().map(x => (x.slug === slug ? { ...x, qty: q } : x)));
    this.persistItems();
  }

  clear(): void {
    this.items.set([]);
    this.coupon.set('');
    this.persistItems();
    this.persistCoupon();
  }

  applyCoupon(code: string): boolean {
    const c = (code || '').trim().toLowerCase();
    this.coupon.set(c);
    this.persistCoupon();
    return c === 'koren5';
  }

  itemTotal(it: CartItem): number {
    return this.priceToNumber(it.price) * it.qty;
  }

  formatEUR(n: number): string {
    return `${Math.max(0, Math.round(n)).toLocaleString('sl-SI')} €`;
  }

  private priceToNumber(v: string): number {
    return Number((v || '').replace(/[^\d]/g, '')) || 0;
  }

  private canStore(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private persistItems(): void {
    if (!this.canStore()) return;
    localStorage.setItem(this.key, JSON.stringify(this.items()));
  }

  private persistCoupon(): void {
    if (!this.canStore()) return;
    localStorage.setItem(this.couponKey, this.coupon());
  }

  private readItems(): CartItem[] {
    if (!this.canStore()) return [];
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private readCoupon(): string {
    if (!this.canStore()) return '';
    return localStorage.getItem(this.couponKey) || '';
  }
}
