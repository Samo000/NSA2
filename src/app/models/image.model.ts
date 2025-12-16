export interface ProductImage {
  src: string
  alt: string
  name: string
  price: string
  slug: string
  specs: string[]
}

export const FEATURED_PRODUCTS: ProductImage[] = [
  {
    src: 'assets/laptop.jpg',
    alt: 'Gaming Laptop',
    name: 'Gaming Laptop',
    price: '1699 €',
    slug: 'gaming-laptop',
    specs: [
      'CPU: Ryzen 7',
      'GPU: RTX 4060',
      'RAM: 16 GB',
      'SSD: 1 TB',
      'Display: 15.6" 144Hz'
    ]
  },
  {
    src: 'assets/keyboard.jpg',
    alt: 'Mechanical Keyboard',
    name: 'Mechanical Keyboard',
    price: '89 €',
    slug: 'keyboard',
    specs: [
      'Switches: Red',
      'Layout: US / ISO',
      'Backlight: RGB',
      'Connection: USB-C',
      'Frame: Aluminum'
    ]
  },
  {
    src: 'assets/monitor.jpg',
    alt: '27 Inch Monitor',
    name: '27" Monitor',
    price: '279 €',
    slug: 'monitor',
    specs: [
      'Resolution: 2560×1440',
      'Refresh rate: 165Hz',
      'Panel: IPS',
      'HDR: HDR10',
      'Ports: DisplayPort + HDMI'
    ]
  },
  {
    src: 'assets/mouse.jpg',
    alt: 'Gaming Mouse',
    name: 'Gaming Mouse',
    price: '59 €',
    slug: 'mouse',
    specs: [
      'Sensor: 26K DPI',
      'Weight: 65g',
      'Switches: Optical',
      'Cable: Paracord',
      'Feet: PTFE'
    ]
  },
  {
    src: 'assets/headset.jpg',
    alt: 'Gaming Headset',
    name: 'Gaming Headset',
    price: '129 €',
    slug: 'headset',
    specs: [
      'Drivers: 50mm',
      'Microphone: Detachable',
      'Surround sound: 7.1',
      'Ear pads: Memory foam',
      'Connection: USB'
    ]
  },
  {
    src: 'assets/chair.jpg',
    alt: 'Gaming Chair',
    name: 'Gaming Chair',
    price: '349 €',
    slug: 'chair',
    specs: [
      'Material: PU leather',
      'Armrests: 4D',
      'Tilt: 90–155°',
      'Max load: 140 kg',
      'Lumbar & neck pillows'
    ]
  },
  {
    src: 'assets/desk.jpg',
    alt: 'Gaming Desk',
    name: 'Gaming Desk',
    price: '399 €',
    slug: 'desk',
    specs: [
      'Width: 140 cm',
      'Depth: 70 cm',
      'Frame: Steel',
      'Cable tray: Yes',
      'Surface: Carbon texture'
    ]
  },
  {
    src: 'assets/mic.jpg',
    alt: 'USB Microphone',
    name: 'USB Microphone',
    price: '149 €',
    slug: 'microphone',
    specs: [
      'Pattern: Cardioid',
      'Sample rate: 96 kHz',
      'Controls: Gain / Mute',
      'Mount: Shock mount',
      'Connection: USB-C'
    ]
  },
  {
    src: 'assets/webcam.jpg',
    alt: 'Webcam',
    name: 'Webcam',
    price: '99 €',
    slug: 'webcam',
    specs: [
      'Video: 1080p',
      'FPS: 60',
      'Focus: Auto',
      'Microphones: Dual',
      'Mount: Tripod ready'
    ]
  }
]
