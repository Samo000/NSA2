export interface ProductImage {
  src: string;
  modelFile?: string;
  alt: string;
  name: string;
  price: string;
  originalPrice?: string;
  slug: string;
  specs: string[];
  category: string;
  rating: number;
  ratingCount: number;
  stock: number;
  discountPercent?: number;
  showDiscountBadge?: boolean;
}

export const FEATURED_PRODUCTS: ProductImage[] = [
  {
    src: '/assets/laptop.jpg',
    alt: 'Gaming Laptop',
    name: 'Gaming Laptop',
    price: '1699 EUR',
    slug: 'gaming-laptop',
    category: 'Racunalniki',
    rating: 4.8,
    ratingCount: 147,
    stock: 8,
    modelFile: '/assets/models/laptop.glb',
    specs: ['CPU: Ryzen 7', 'GPU: RTX 4060', 'RAM: 16 GB', 'SSD: 1 TB', 'Display: 15.6" 144Hz']
  },
  {
    src: '/assets/keyboard.jpg',
    alt: 'Mechanical Keyboard',
    name: 'Mechanical Keyboard',
    price: '89 EUR',
    slug: 'keyboard',
    category: 'Periferija',
    rating: 4.6,
    ratingCount: 203,
    stock: 16,
    modelFile: '/assets/models/keyboard.glb',
    specs: ['Switches: Red', 'Layout: US / ISO', 'Backlight: RGB', 'Connection: USB-C', 'Frame: Aluminum']
  },
  {
    src: '/assets/monitor.jpg',
    alt: '27 Inch Monitor',
    name: '27" Monitor',
    price: '279 EUR',
    slug: 'monitor',
    category: 'Monitorji',
    rating: 4.7,
    ratingCount: 121,
    stock: 5,
    modelFile: '/assets/models/monitor.glb',
    specs: [
      'Resolution: 2560x1440',
      'Refresh rate: 165Hz',
      'Panel: IPS',
      'HDR: HDR10',
      'Ports: DisplayPort + HDMI'
    ]
  },
  {
    src: '/assets/mouse.jpg',
    alt: 'Gaming Mouse',
    name: 'Gaming Mouse',
    price: '59 EUR',
    slug: 'mouse',
    category: 'Periferija',
    rating: 4.4,
    ratingCount: 166,
    stock: 23,
    modelFile: '/assets/models/mouse.glb',
    specs: ['Sensor: 26K DPI', 'Weight: 65g', 'Switches: Optical', 'Cable: Paracord', 'Feet: PTFE']
  },
  {
    src: '/assets/headset.jpg',
    alt: 'Gaming Headset',
    name: 'Gaming Headset',
    price: '129 EUR',
    slug: 'headset',
    category: 'Audio',
    rating: 4.5,
    ratingCount: 98,
    stock: 0,
    modelFile: '/assets/models/headset.glb',
    specs: [
      'Drivers: 50mm',
      'Microphone: Detachable',
      'Surround sound: 7.1',
      'Ear pads: Memory foam',
      'Connection: USB'
    ]
  },
  {
    src: '/assets/chair.jpg',
    alt: 'Gaming Chair',
    name: 'Gaming Chair',
    price: '349 EUR',
    slug: 'chair',
    category: 'Pisarna',
    rating: 4.3,
    ratingCount: 84,
    stock: 4,
    modelFile: '/assets/models/chair.glb',
    specs: ['Material: PU leather', 'Armrests: 4D', 'Tilt: 90-155 deg', 'Max load: 140 kg', 'Lumbar & neck pillows']
  },
  {
    src: '/assets/desk.jpg',
    alt: 'Gaming Desk',
    name: 'Gaming Desk',
    price: '399 EUR',
    slug: 'desk',
    category: 'Pisarna',
    rating: 4.7,
    ratingCount: 67,
    stock: 2,
    modelFile: '/assets/models/desk.glb',
    specs: ['Width: 140 cm', 'Depth: 70 cm', 'Frame: Steel', 'Cable tray: Yes', 'Surface: Carbon texture']
  },
  {
    src: '/assets/mic.jpg',
    alt: 'USB Microphone',
    name: 'USB Microphone',
    price: '149 EUR',
    slug: 'microphone',
    category: 'Audio',
    rating: 4.6,
    ratingCount: 112,
    stock: 11,
    modelFile: '/assets/models/mic.glb',
    specs: ['Pattern: Cardioid', 'Sample rate: 96 kHz', 'Controls: Gain / Mute', 'Mount: Shock mount', 'Connection: USB-C']
  },
  {
    src: '/assets/webcam.jpg',
    alt: 'Webcam',
    name: 'Webcam',
    price: '99 EUR',
    slug: 'webcam',
    category: 'Video',
    rating: 4.2,
    ratingCount: 75,
    stock: 9,
    modelFile: '/assets/models/webcam.glb',
    specs: ['Video: 1080p', 'FPS: 60', 'Focus: Auto', 'Microphones: Dual', 'Mount: Tripod ready']
  }
];
