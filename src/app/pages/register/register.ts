import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  birthDate = '';

  showPassword = false;
  showConfirm = false;

  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.error = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword ||
      !this.birthDate.trim()
    ) {
      this.error = 'Izpolni vsa polja.';
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
    if (!emailOk) {
      this.error = 'E-pošta ni veljavna.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Geslo mora imeti vsaj 8 znakov.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Gesli se ne ujemata.';
      return;
    }

    this.loading = true;

    this.auth.register(
      this.firstName,
      this.lastName,
      this.email,
      this.password,
      this.confirmPassword,
      this.birthDate
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/cart');
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message || 'Registracija ni uspela.';
      }
    });
  }
}
