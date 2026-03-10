import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

type User = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  role: 'user' | 'admin';
};

type AuthResponse = {
  token: string;
  user: User;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly api = 'http://localhost:3000/api';
  private readonly userKey = 'techmarket_auth_user';
  private readonly tokenKey = 'techmarket_auth_token';

  private user: User | null = null;
  private token: string | null = null;
  readonly authChanges = new Subject<'login' | 'register' | 'logout'>();

  constructor() {
    this.user = this.readUser();
    this.token = this.readToken();
  }

  isLoggedIn(): boolean {
    return !!this.token && !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const payload = { email: (email || '').trim().toLowerCase(), password: password || '' };

    return this.http.post<AuthResponse>(`${this.api}/auth/login`, payload).pipe(
      tap((res) => {
        this.user = res.user;
        this.token = res.token;
        this.writeUser(res.user);
        this.writeToken(res.token);
        this.authChanges.next('login');
      })
    );
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    birthDate: string
  ): Observable<AuthResponse> {
    const payload = {
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      email: (email || '').trim().toLowerCase(),
      password: password || '',
      confirmPassword: confirmPassword || '',
      birthDate: (birthDate || '').trim()
    };

    return this.http.post<AuthResponse>(`${this.api}/auth/register`, payload).pipe(
      tap((res) => {
        this.user = res.user;
        this.token = res.token;
        this.writeUser(res.user);
        this.writeToken(res.token);
        this.authChanges.next('register');
      })
    );
  }

  logout(): void {
    this.user = null;
    this.token = null;
    this.clearAuth();
    this.authChanges.next('logout');
  }

  private canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readUser(): User | null {
    if (!this.canUseStorage()) return null;
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private writeUser(u: User): void {
    if (!this.canUseStorage()) return;
    localStorage.setItem(this.userKey, JSON.stringify(u));
  }

  private readToken(): string | null {
    if (!this.canUseStorage()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  private writeToken(t: string): void {
    if (!this.canUseStorage()) return;
    localStorage.setItem(this.tokenKey, t);
  }

  private clearAuth(): void {
    if (!this.canUseStorage()) return;
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
  }
}
