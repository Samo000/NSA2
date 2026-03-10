import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { ProductImage } from '../models/image.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class WishlistComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  importMessage = '';
  copyMessage = '';

  constructor(
    public wishlist: WishlistService,
    public cart: CartService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      const itemsParam = params.get('items');
      if (!itemsParam) return;

      const parsed = itemsParam
        .split(',')
        .map((slug) => slug.trim())
        .filter((slug) => Boolean(slug));

      const importedCount = this.wishlist.replace(parsed);
      this.importMessage =
        importedCount > 0
          ? `Deljeni seznam je nalozen (${importedCount} izdelkov).`
          : 'Povezava ne vsebuje veljavnih izdelkov.';
    });
  }

  products(): ProductImage[] {
    return this.wishlist.savedProducts();
  }

  shareUrl(): string {
    if (!this.isBrowser) return '';

    const shareParam = this.wishlist.toShareParam();
    if (!shareParam) return '';

    const urlTree = this.router.createUrlTree(['/wishlist'], {
      queryParams: { items: shareParam }
    });

    return `${window.location.origin}${this.router.serializeUrl(urlTree)}`;
  }

  async copyShareLink(): Promise<void> {
    this.copyMessage = '';
    const url = this.shareUrl();
    if (!url) {
      this.copyMessage = 'Seznam zelja je prazen.';
      return;
    }

    if (!this.isBrowser || !navigator.clipboard?.writeText) {
      this.copyMessage = 'Kopiranje ni podprto v tem okolju.';
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      this.copyMessage = 'Povezava je kopirana.';
    } catch {
      this.copyMessage = 'Povezave ni bilo mogoce kopirati.';
    }
  }

  remove(slug: string): void {
    this.wishlist.remove(slug);
  }

  clearAll(): void {
    this.wishlist.clear();
    this.copyMessage = '';
  }

  addToCart(product: ProductImage): void {
    this.cart.addProduct(product, 1);
  }
}
