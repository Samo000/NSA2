export interface ProductImage {
  src: string;
  alt: string;
  name: string;
  price: string;
}

export const FEATURED_PRODUCTS: ProductImage[] = [
  {
    src: 'assets/laptop.jpg',
    alt: 'Gaming prenosnik',
    name: 'Gaming prenosnik',
    price: '1.699 €'
  },
  {
    src: 'assets/keyboard.jpg',
    alt: 'Mehanska tipkovnica',
    name: 'Mehanska tipkovnica',
    price: '89 €'
  },
  {
    src: 'assets/monitor.jpg',
    alt: '27” Monitor',
    name: '27” Monitor',
    price: '279 €'
  }
];
