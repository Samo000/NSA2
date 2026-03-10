import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { HelpAiComponent } from './components/help-ai/help-ai';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, HelpAiComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
