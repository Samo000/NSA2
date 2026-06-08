import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductImage } from '../../../models/image.model';
import { ProductCatalogService } from '../../../services/product-catalog.service';

@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products-section.html',
  styleUrl: './products-section.scss'
})
export class ProductsSectionComponent implements OnInit {
  private readonly catalog = inject(ProductCatalogService);
  private readonly cdr = inject(ChangeDetectorRef);

  get products(): ProductImage[] {
    return this.catalog.products();
  }

  ngOnInit(): void {
    void this.catalog.load().finally(() => this.cdr.markForCheck());
  }
}
