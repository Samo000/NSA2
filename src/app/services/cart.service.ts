import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  items: string[] = [];

  add(item: string) {
    this.items.push(item);
  }

  remove(index: number) {
    this.items.splice(index, 1);
  }

  clear() {
    this.items = [];
  }
}
