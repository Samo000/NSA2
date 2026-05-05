import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { FEATURED_PRODUCTS, ProductImage } from '../models/image.model';
import { injectApiBaseUrl } from './api-base';

type WishlistResponse = {
  slugs: string[];
};

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly key = 'techmarket_saved_items_v1';
  private readonly api = `${injectApiBaseUrl()}/wishlist`;
  private readonly knownSlugs = new Set(FEATURED_PRODUCTS.map((item) => item.slug));

  private syncing = false;

  savedSlugs = signal<string[]>(this.readSavedSlugs());
  savedProducts = computed<ProductImage[]>(() => {
    const bySlug = new Map(FEATURED_PRODUCTS.map((product) => [product.slug, product]));

    return this.savedSlugs()
      .map((slug) => bySlug.get(slug))
      .filter((product): product is ProductImage => Boolean(product));
  });

  constructor() {
    this.auth.authChanges.subscribe((event) => {
      if (event === 'logout') {
        this.clearLocalOnly();
        return;
      }

      void this.syncWithServer();
    });

    if (this.auth.isLoggedIn()) {
      void this.syncWithServer();
    }
  }

  isSaved(slug: string): boolean {
    return this.savedSlugs().includes(slug);
  }

  toggle(product: ProductImage): void {
    const slug = (product.slug || '').trim();
    if (!slug) return;

    const current = this.savedSlugs();
    const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current];

    this.setLocal(next);
    this.pushToServerIfLoggedIn();
  }

  remove(slug: string): void {
    const next = this.savedSlugs().filter((item) => item !== slug);
    this.setLocal(next);
    this.pushToServerIfLoggedIn();
  }

  clear(): void {
    this.setLocal([]);
    this.pushToServerIfLoggedIn();
  }

  replace(slugs: string[]): number {
    const next = this.normalizeSlugs(slugs);
    this.setLocal(next);
    this.pushToServerIfLoggedIn();
    return next.length;
  }

  toShareParam(): string {
    return this.savedSlugs().join(',');
  }

  async syncWithServer(): Promise<void> {
    if (!this.auth.isLoggedIn() || this.syncing) return;

    const headers = this.authHeaders();
    if (!headers) return;

    this.syncing = true;

    try {
      const response = await firstValueFrom(this.http.get<WishlistResponse>(this.api, { headers }));
      const serverSlugs = this.normalizeSlugs(response?.slugs || []);
      const merged = this.normalizeSlugs([...serverSlugs, ...this.savedSlugs()]);
      this.setLocal(merged);
      await this.saveToServer(merged);
    } catch {
      // Keep local state if backend sync fails.
    } finally {
      this.syncing = false;
    }
  }

  private pushToServerIfLoggedIn(): void {
    if (!this.auth.isLoggedIn()) return;
    void this.saveToServer(this.savedSlugs());
  }

  private async saveToServer(slugs: string[]): Promise<void> {
    const headers = this.authHeaders();
    if (!headers) return;

    try {
      await firstValueFrom(this.http.put<WishlistResponse>(this.api, { slugs: this.normalizeSlugs(slugs) }, { headers }));
    } catch {
      // Local storage remains source of truth until next successful sync.
    }
  }

  private authHeaders(): HttpHeaders | null {
    const token = this.auth.getToken();
    if (!token) return null;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private normalizeSlugs(input: string[]): string[] {
    const unique: string[] = [];
    const seen = new Set<string>();

    input.forEach((raw) => {
      const slug = String(raw || '').trim();
      if (!slug || seen.has(slug) || !this.knownSlugs.has(slug)) return;
      seen.add(slug);
      unique.push(slug);
    });

    return unique;
  }

  private canStore(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private clearLocalOnly(): void {
    this.setLocal([]);
  }

  private setLocal(list: string[]): void {
    const normalized = this.normalizeSlugs(list);
    this.savedSlugs.set(normalized);
    this.persist(normalized);
  }

  private persist(list: string[]): void {
    if (!this.canStore()) return;
    localStorage.setItem(this.key, JSON.stringify(list));
  }

  private readSavedSlugs(): string[] {
    if (!this.canStore()) return [];

    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return this.normalizeSlugs(parsed.map((item) => String(item || '')));
    } catch {
      return [];
    }
  }
}
