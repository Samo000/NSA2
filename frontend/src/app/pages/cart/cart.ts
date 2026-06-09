import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartItem, CartService } from '../../services/cart.service';
import { injectApiBaseUrl } from '../../services/api-base';

type OrderResponse = {
  orderNumber: string;
};

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
  lastOrderItems: CartItem[] = [];
  private readonly ordersApi = `${injectApiBaseUrl()}/orders`;

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

  constructor(
    public cart: CartService,
    private readonly http: HttpClient,
    private readonly auth: AuthService
  ) {}

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
    this.lastOrderItems = [];
  }

  hasConfirmedOrder(): boolean {
    return !!this.checkoutSuccess && this.lastOrderItems.length > 0;
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

  async confirmOrder(): Promise<void> {
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

    try {
      const items = this.cart.items();
      const response = await firstValueFrom(
        this.http.post<OrderResponse>(
          this.ordersApi,
          {
            items: items.map((item) => ({
              slug: item.slug,
              quantity: item.qty
            })),
            checkout: this.checkout,
            coupon: this.cart.coupon()
          },
          this.requestOptions()
        )
      );

      this.lastOrderItems = items;
      this.orderNumber = response.orderNumber;
      this.checkoutSuccess = 'Uspešen nakup. Narocilo je bilo shranjeno v bazo.';
      this.cart.clear();
    } catch (error: any) {
      this.checkoutError = error?.error?.message || 'Order could not be completed. Please try again.';
    } finally {
      this.processing = false;
    }
  }

  private requestOptions(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    return {
      headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders()
    };
  }
}
