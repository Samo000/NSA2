import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { injectApiBaseUrl } from './api-base';

export type ProductReview = {
  id: string;
  slug: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewStore = Record<string, ProductReview[]>;

type ReviewResult =
  | { ok: true; review: ProductReview }
  | { ok: false; message: string };

type ReviewsResponse = {
  reviews: ProductReview[];
};

type CreateReviewResponse = {
  review: ProductReview;
};

@Injectable({ providedIn: 'root' })
export class ProductReviewsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = `${injectApiBaseUrl()}/reviews`;
  private readonly store = signal<ReviewStore>({});

  reviewsFor(slug: string): ProductReview[] {
    return [...(this.store()[slug] || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  statsFor(slug: string): { count: number; average: number } {
    const reviews = this.store()[slug] || [];
    if (!reviews.length) return { count: 0, average: 0 };

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return { count: reviews.length, average: sum / reviews.length };
  }

  async loadForSlug(slug: string): Promise<void> {
    const cleanSlug = String(slug || '').trim();
    if (!cleanSlug) return;

    try {
      const response = await firstValueFrom(this.http.get<ReviewsResponse>(`${this.api}/${cleanSlug}`));
      const reviews = this.normalizeList(response?.reviews || [], cleanSlug);
      this.store.update((current) => ({ ...current, [cleanSlug]: reviews }));
    } catch {
      // Keep previous reviews if request fails.
    }
  }

  async addReview(slug: string, rating: number, comment: string): Promise<ReviewResult> {
    const cleanSlug = String(slug || '').trim();
    const cleanComment = String(comment || '').trim();
    const normalizedRating = Number(rating);

    if (!this.auth.isLoggedIn()) return { ok: false, message: 'Za oddajo ocene se prijavi.' };
    if (!cleanSlug) return { ok: false, message: 'Izdelek ni najden.' };
    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return { ok: false, message: 'Ocena mora biti med 1 in 5.' };
    }
    if (cleanComment.length < 10) {
      return { ok: false, message: 'Komentar mora vsebovati vsaj 10 znakov.' };
    }

    const headers = this.authHeaders();
    if (!headers) return { ok: false, message: 'Prijava je potekla. Prijavi se znova.' };

    try {
      const response = await firstValueFrom(
        this.http.post<CreateReviewResponse>(
          `${this.api}/${cleanSlug}`,
          { rating: normalizedRating, comment: cleanComment },
          { headers }
        )
      );

      const review = this.normalizeReview(response?.review, cleanSlug);
      if (!review) return { ok: false, message: 'Ocene ni bilo mogoce shraniti.' };

      const current = this.reviewsFor(cleanSlug);
      const withoutExisting = current.filter((item) => item.id !== review.id);
      this.store.update((state) => ({ ...state, [cleanSlug]: [review, ...withoutExisting] }));

      return { ok: true, review };
    } catch (error: unknown) {
      const message = this.extractErrorMessage(error) || 'Ocene ni bilo mogoce shraniti.';
      return { ok: false, message };
    }
  }

  private authHeaders(): HttpHeaders | null {
    const token = this.auth.getToken();
    if (!token) return null;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private normalizeList(input: ProductReview[], slug: string): ProductReview[] {
    return input
      .map((review) => this.normalizeReview(review, slug))
      .filter((review): review is ProductReview => Boolean(review));
  }

  private normalizeReview(input: unknown, fallbackSlug: string): ProductReview | null {
    if (!input || typeof input !== 'object') return null;
    const raw = input as Partial<ProductReview>;
    const rating = Number(raw.rating);

    if (!raw.id || !raw.author || !raw.comment || !raw.createdAt || !Number.isFinite(rating)) {
      return null;
    }

    if (rating < 1 || rating > 5) return null;

    return {
      id: String(raw.id),
      slug: String(raw.slug || fallbackSlug),
      author: String(raw.author),
      comment: String(raw.comment),
      createdAt: String(raw.createdAt),
      rating: Math.round(rating)
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (!error || typeof error !== 'object') return '';

    const maybeError = error as { error?: { message?: unknown } };
    const message = maybeError.error?.message;
    return typeof message === 'string' ? message : '';
  }
}
