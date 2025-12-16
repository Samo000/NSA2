import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  error = '';

  showPassword = false;
  showConfirm = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (
      !this.firstName ||
      !this.lastName ||
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.birthDate
    ) {
      this.error = 'Vsa polja so obvezna';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Gesli se ne ujemata';
      return;
    }

    this.auth.login();
    this.router.navigateByUrl('/');
  }
}
