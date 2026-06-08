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
  checkoutError = '';
  checkoutSuccess = '';
  processing = false;
  orderNumber = '';

  checkout = {
    email: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovenia',
    shipping: 'standard',
    payment: 'card',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    acceptedTerms: false
  };

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
    this.checkoutError = '';
    this.checkoutSuccess = '';
    this.orderNumber = '';
  }

  checkoutDisabled(): boolean {
    if (this.processing || this.cart.items().length === 0) return true;

    const baseMissing =
      !this.checkout.email.trim() ||
      !this.checkout.fullName.trim() ||
      !this.checkout.phone.trim() ||
      !this.checkout.address.trim() ||
      !this.checkout.city.trim() ||
      !this.checkout.postalCode.trim() ||
      !this.checkout.country.trim() ||
      !this.checkout.acceptedTerms;

    if (baseMissing) return true;

    if (this.checkout.payment !== 'card') return false;

    return (
      !this.checkout.cardName.trim() ||
      !this.checkout.cardNumber.trim() ||
      !this.checkout.cardExpiry.trim() ||
      !this.checkout.cardCvc.trim()
    );
  }

  confirmOrder(): void {
    this.checkoutError = '';
    this.checkoutSuccess = '';

    if (this.checkoutDisabled()) {
      this.checkoutError = 'Please fill all required checkout fields.';
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.checkout.email.trim());
    if (!emailOk) {
      this.checkoutError = 'Please enter a valid email address.';
      return;
    }

    this.processing = true;

    setTimeout(() => {
      this.processing = false;
      this.orderNumber = `TM-${Date.now().toString().slice(-8)}`;
      this.checkoutSuccess = 'Order confirmed. This is a demo checkout. No payment was charged.';
      this.cart.clear();
    }, 1300);
  }
}
