import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar-buttons',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar-buttons.html',
  styleUrl: './navbar-buttons.scss'
})
export class NavbarButtonsComponent {}
