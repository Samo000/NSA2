import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductImage } from '../../../models/image.model';
import { ProductCatalogService } from '../../../services/product-catalog.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  index = 0;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly catalog = inject(ProductCatalogService);
  private readonly cdr = inject(ChangeDetectorRef);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly intervalMs = 2400;

  get slides(): ProductImage[] {
    return this.catalog.products();
  }

  ngOnInit(): void {
    void this.catalog.load().finally(() => {
      this.clampIndex();
      this.cdr.markForCheck();
    });
    if (isPlatformBrowser(this.platformId)) this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start(): void {
    this.stop();
    this.scheduleNext();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next(): void {
    if (!this.slides.length) return;
    this.index = (this.index + 1) % this.slides.length;
    this.scheduleNext();
  }

  goTo(i: number): void {
    this.index = Math.max(0, Math.min(i, this.slides.length - 1));
    if (isPlatformBrowser(this.platformId)) this.start();
  }

  private clampIndex(): void {
    if (!this.slides.length) {
      this.index = 0;
      return;
    }

    this.index = Math.min(this.index, this.slides.length - 1);
  }

  private scheduleNext(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.stop();
    this.timer = setTimeout(() => this.next(), this.intervalMs);
  }

  trackBySlug(_: number, s: ProductImage): string {
    return s.slug;
  }
}
