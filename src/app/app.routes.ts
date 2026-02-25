import { Routes } from '@angular/router';
import { ContentComponent } from './components/content/content';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { CartComponent } from './pages/cart/cart';
import { ProductPageComponent } from './pages/product/product';
import { ShopComponent } from './pages/shop/shop';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { AdminComponent } from './pages/admin/admin';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: ContentComponent },
  { path: 'izdelki', component: ShopComponent },
  { path: 'o-nas', component: AboutComponent },
  { path: 'kontakt', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'product/:slug', component: ProductPageComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];