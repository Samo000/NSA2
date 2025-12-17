import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  email = 'test@techmarket.si';
  password = 'Test123!';
  show = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    const ok = this.auth.login(this.email, this.password);
    if (ok) this.router.navigateByUrl('/cart');
    else this.error = 'Napačen e-poštni naslov ali geslo.';
  }
}
