import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  text: string;
}

@Component({
  selector: 'app-help-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help-ai.html',
  styleUrl: './help-ai.scss'
})
export class HelpAiComponent {
  isOpen = false;
  isTyping = false;
  input = '';
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      text: 'Hi! I am your help assistant. Ask me about login, orders, cart, shipping, or products.'
    }
  ];

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  sendMessage() {
    const message = this.input.trim();
    if (!message || this.isTyping) {
      return;
    }

    this.messages.push({ role: 'user', text: message });
    this.input = '';
    this.isTyping = true;
    this.scrollToBottom();

    const response = this.buildResponse(message);
    setTimeout(() => {
      this.messages.push({ role: 'assistant', text: response });
      this.isTyping = false;
      this.scrollToBottom();
    }, 500);
  }

  private buildResponse(raw: string): string {
    const prompt = raw.toLowerCase();

    if (this.hasAny(prompt, ['hello', 'hi', 'hey'])) {
      return 'Hello! Tell me what you need and I will guide you.';
    }

    if (this.hasAny(prompt, ['login', 'sign in', 'register', 'account'])) {
      return 'Use the Login or Register buttons in the top navigation. If login fails, check your email/password and try again.';
    }

    if (this.hasAny(prompt, ['cart', 'basket', 'kosarica'])) {
      return 'Open Cart from the top bar. You can update quantities there and proceed to checkout.';
    }

    if (this.hasAny(prompt, ['order', 'orders', 'checkout', 'payment'])) {
      return 'To place an order: add products to cart, open cart, and complete checkout. You can review order status in your account section.';
    }

    if (this.hasAny(prompt, ['ship', 'delivery', 'arrive'])) {
      return 'Delivery time depends on destination and stock. Most orders are processed quickly after payment confirmation.';
    }

    if (this.hasAny(prompt, ['product', 'stock', 'available'])) {
      return 'Open the products page to see details and availability. If a product is out of stock, check back later for updates.';
    }

    if (this.hasAny(prompt, ['admin'])) {
      return 'Admin tools are only available to admin users. If you should have access, log in with your admin account.';
    }

    if (this.hasAny(prompt, ['contact', 'support', 'help'])) {
      return 'For direct support, use the Contact page in navigation and send your message. Include your order details for faster help.';
    }

    return 'I can help with login, cart, orders, shipping, products, and support. Try asking about one of these.';
  }

  private hasAny(text: string, words: string[]) {
    return words.some((word) => text.includes(word));
  }

  private scrollToBottom() {
    const container = this.messagesContainer?.nativeElement;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }
}
