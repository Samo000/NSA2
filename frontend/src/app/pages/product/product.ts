import { ChangeDetectorRef, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductImage } from '../../models/image.model';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductReview, ProductReviewsService } from '../../services/product-reviews.service';
import { ProductCatalogService } from '../../services/product-catalog.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product.html',
  styleUrl: './product.scss'
})
export class ProductPageComponent {
  slug = signal<string>('');
  loadingProduct = signal<boolean>(true);
  readonly stars = [1, 2, 3, 4, 5];

  reviewRating = 5;
  reviewComment = '';
  reviewMessage = '';
  reviewError = '';

  product = computed<ProductImage | null>(() => {
    const s = this.slug();
    return this.catalog.products().find((p) => p.slug === s) ?? null;
  });

  constructor(
    route: ActivatedRoute,
    public cart: CartService,
    public wishlist: WishlistService,
    public productReviews: ProductReviewsService,
    private readonly catalog: ProductCatalogService,
    private readonly cdr: ChangeDetectorRef
  ) {
    route.paramMap.subscribe((p) => {
      const slug = p.get('slug') ?? '';
      this.slug.set(slug);
      this.loadingProduct.set(Boolean(slug));
      if (slug) {
        void this.catalog.loadOne(slug).finally(() => {
          this.loadingProduct.set(false);
          this.cdr.markForCheck();
        });
      }
      if (slug) void this.productReviews.loadForSlug(slug);
    });
  }

  add(p: ProductImage): void {
    this.cart.addProduct(p, 1);
  }

  currentProduct(): ProductImage | null {
    return this.product();
  }

  allProducts(): ProductImage[] {
    return this.catalog.products();
  }

  toggleSaved(p: ProductImage): void {
    this.wishlist.toggle(p);
  }

  isSaved(slug: string): boolean {
    return this.wishlist.isSaved(slug);
  }

  userReviews(slug: string): ProductReview[] {
    return this.productReviews.reviewsFor(slug);
  }

  averageRating(product: ProductImage): number {
    const userStats = this.productReviews.statsFor(product.slug);
    const totalCount = product.ratingCount + userStats.count;
    if (!totalCount) return 0;

    const weightedSum = product.rating * product.ratingCount + userStats.average * userStats.count;
    return weightedSum / totalCount;
  }

  totalReviewCount(product: ProductImage): number {
    return product.ratingCount + this.productReviews.statsFor(product.slug).count;
  }

  async submitReview(product: ProductImage): Promise<void> {
    this.reviewMessage = '';
    this.reviewError = '';

    const result = await this.productReviews.addReview(product.slug, this.reviewRating, this.reviewComment);
    if (!result.ok) {
      this.reviewError = result.message;
      return;
    }

    this.reviewRating = 5;
    this.reviewComment = '';
    this.reviewMessage = 'Hvala. Ocena je bila uspesno dodana.';
  }

  formatReviewDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Neznan datum';

    return new Intl.DateTimeFormat('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}
