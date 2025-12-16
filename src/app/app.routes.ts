import { Routes } from '@angular/router';
import { ContentComponent } from './components/content/content';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { CartComponent } from './pages/cart/cart';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ContentComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
