import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NAV_BUTTONS, Button } from '../../../models/button.model';

@Component({
  selector: 'app-navbar-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-buttons.html',
  styleUrl: './navbar-buttons.scss'
})
export class NavbarButtonsComponent {
  buttons: Button[] = NAV_BUTTONS;
}
