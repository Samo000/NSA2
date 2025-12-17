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

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit(): void {
    this.error = '';

    if (
      !this.firstName ||
      !this.lastName ||
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.birthDate
    ) {
      this.error = 'Izpolni vsa polja.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Gesli se ne ujemata.';
      return;
    }

    const ok = this.auth.register(
      this.firstName,
      this.lastName,
      this.email,
      this.password,
      this.birthDate
    );

    if (ok) {
      this.router.navigateByUrl('/cart');
    } else {
      this.error = 'Registracija ni uspela.';
    }
  }
}
