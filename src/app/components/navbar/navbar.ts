import { Component } from '@angular/core';
import { NavbarButtonsComponent } from './navbar-buttons/navbar-buttons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NavbarButtonsComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {}
