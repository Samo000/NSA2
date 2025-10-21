import { Component, ViewEncapsulation } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { ContentComponent } from './components/content/content';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, ContentComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.None
})
export class App {
  year = new Date().getFullYear();
}
