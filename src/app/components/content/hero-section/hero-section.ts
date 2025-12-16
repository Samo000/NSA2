import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ProductImage, FEATURED_PRODUCTS } from '../../../models/image.model';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  slides: ProductImage[] = FEATURED_PRODUCTS;
  index = 0;

  private readonly platformId = inject(PLATFORM_ID);
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs = 3200;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start(): void {
    this.stop();
    this.timer = setInterval(() => this.next(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  pause(): void {
    this.stop();
  }

  resume(): void {
    if (isPlatformBrowser(this.platformId)) this.start();
  }

  next(): void {
    if (!this.slides.length) return;
    this.index = (this.index + 1) % this.slides.length;
  }

  goTo(i: number): void {
    this.index = i;
    if (isPlatformBrowser(this.platformId)) this.start();
  }

  trackBySlug(_: number, s: ProductImage): string {
    return s.slug;
  }
}
