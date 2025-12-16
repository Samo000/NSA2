import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private logged = false;

  login() {
    this.logged = true;
  }

  logout() {
    this.logged = false;
  }

  isLoggedIn(): boolean {
    return this.logged;
  }
}
