import { Injectable, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type User = { firstName: string; lastName: string; email: string; birthDate: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'techmarket_auth_user';

  private user: User | null = null;

  private readonly staticAccount = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@techmarket.si',
    password: 'Test123!',
    birthDate: '2005-01-01'
  };

  constructor() {
    this.user = this.readUser();
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  login(email: string, password: string): boolean {
    const e = (email || '').trim().toLowerCase();
    const p = password || '';

    const saved = this.readUser();
    if (saved && saved.email.toLowerCase() === e) {
      const savedPass = this.readPasswordForSavedUser() ?? '';
      if (savedPass === p) {
        this.user = saved;
        this.writeUser(saved);
        return true;
      }
    }

    if (e === this.staticAccount.email.toLowerCase() && p === this.staticAccount.password) {
      const u: User = {
        firstName: this.staticAccount.firstName,
        lastName: this.staticAccount.lastName,
        email: this.staticAccount.email,
        birthDate: this.staticAccount.birthDate
      };
      this.user = u;
      this.writeUser(u);
      this.writePasswordForSavedUser(this.staticAccount.password);
      return true;
    }

    return false;
  }

  register(firstName: string, lastName: string, email: string, password: string, birthDate: string): boolean {
    const e = (email || '').trim().toLowerCase();
    if (!e || !password) return false;

    const u: User = {
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      email: e,
      birthDate: (birthDate || '').trim()
    };

    this.user = u;
    this.writeUser(u);
    this.writePasswordForSavedUser(password);
    return true;
  }

  logout(): void {
    this.user = null;
    this.clearUser();
  }

  private canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readUser(): User | null {
    if (!this.canUseStorage()) return null;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private writeUser(u: User): void {
    if (!this.canUseStorage()) return;
    localStorage.setItem(this.storageKey, JSON.stringify(u));
  }

  private clearUser(): void {
    if (!this.canUseStorage()) return;
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.storageKey + '_pw');
  }

  private readPasswordForSavedUser(): string | null {
    if (!this.canUseStorage()) return null;
    return localStorage.getItem(this.storageKey + '_pw');
  }

  private writePasswordForSavedUser(pw: string): void {
    if (!this.canUseStorage()) return;
    localStorage.setItem(this.storageKey + '_pw', pw);
  }
}
