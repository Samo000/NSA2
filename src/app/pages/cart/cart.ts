import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent {
  code = '';
  codeMsg = '';

  constructor(public cart: CartService) {}

  applyCoupon(): void {
    const ok = this.cart.applyCoupon(this.code);
    this.codeMsg = ok ? 'Koda uspešno uporabljena (-5%)' : 'Neveljavna koda';
  }

  inc(slug: string, qty: number): void {
    this.cart.setQty(slug, qty + 1);
  }

  dec(slug: string, qty: number): void {
    this.cart.setQty(slug, Math.max(1, qty - 1));
  }

  remove(slug: string): void {
    this.cart.remove(slug);
  }

  clear(): void {
    this.cart.clear();
  }
}
