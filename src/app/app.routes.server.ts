import { RenderMode, ServerRoute } from '@angular/ssr';
import { FEATURED_PRODUCTS } from './models/image.model';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'product/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return FEATURED_PRODUCTS.map((product) => ({ slug: product.slug }));
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
