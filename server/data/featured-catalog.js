const featuredProductsSeed = [
  {
    name: 'Gaming Laptop',
    slug: 'gaming-laptop',
    category: 'Racunalniki',
    price: 1699,
    stock: 8,
    image: '/assets/laptop.jpg',
    modelFile: '/assets/models/laptop.glb',
    rating: 4.8,
    ratingCount: 147,
    specs: ['CPU: Ryzen 7', 'GPU: RTX 4060', 'RAM: 16 GB', 'SSD: 1 TB', 'Display: 15.6" 144Hz'],
    description: 'Gaming laptop built for high FPS and content creation.'
  },
  {
    name: 'Mechanical Keyboard',
    slug: 'keyboard',
    category: 'Periferija',
    price: 89,
    stock: 16,
    image: '/assets/keyboard.jpg',
    modelFile: '/assets/models/keyboard.glb',
    rating: 4.6,
    ratingCount: 203,
    specs: ['Switches: Red', 'Layout: US / ISO', 'Backlight: RGB', 'Connection: USB-C', 'Frame: Aluminum'],
    description: 'Mechanical keyboard with fast switches and RGB lighting.'
  },
  {
    name: '27" Monitor',
    slug: 'monitor',
    category: 'Monitorji',
    price: 279,
    stock: 5,
    image: '/assets/monitor.jpg',
    modelFile: '/assets/models/monitor.glb',
    rating: 4.7,
    ratingCount: 121,
    specs: [
      'Resolution: 2560x1440',
      'Refresh rate: 165Hz',
      'Panel: IPS',
      'HDR: HDR10',
      'Ports: DisplayPort + HDMI'
    ],
    description: '27-inch high-refresh monitor for gaming and productivity.'
  },
  {
    name: 'Gaming Mouse',
    slug: 'mouse',
    category: 'Periferija',
    price: 59,
    stock: 23,
    image: '/assets/mouse.jpg',
    modelFile: '/assets/models/mouse.glb',
    rating: 4.4,
    ratingCount: 166,
    specs: ['Sensor: 26K DPI', 'Weight: 65g', 'Switches: Optical', 'Cable: Paracord', 'Feet: PTFE'],
    description: 'Lightweight gaming mouse with a high-precision sensor.'
  },
  {
    name: 'Gaming Headset',
    slug: 'headset',
    category: 'Audio',
    price: 129,
    stock: 0,
    image: '/assets/headset.jpg',
    modelFile: '/assets/models/headset.glb',
    rating: 4.5,
    ratingCount: 98,
    specs: [
      'Drivers: 50mm',
      'Microphone: Detachable',
      'Surround sound: 7.1',
      'Ear pads: Memory foam',
      'Connection: USB'
    ],
    description: 'Surround gaming headset with a detachable mic.'
  },
  {
    name: 'Gaming Chair',
    slug: 'chair',
    category: 'Pisarna',
    price: 349,
    stock: 4,
    image: '/assets/chair.jpg',
    modelFile: '/assets/models/chair.glb',
    rating: 4.3,
    ratingCount: 84,
    specs: ['Material: PU leather', 'Armrests: 4D', 'Tilt: 90-155 deg', 'Max load: 140 kg', 'Lumbar & neck pillows'],
    description: 'Ergonomic chair for long sessions at your desk.'
  },
  {
    name: 'Gaming Desk',
    slug: 'desk',
    category: 'Pisarna',
    price: 399,
    stock: 2,
    image: '/assets/desk.jpg',
    modelFile: '/assets/models/desk.glb',
    rating: 4.7,
    ratingCount: 67,
    specs: ['Width: 140 cm', 'Depth: 70 cm', 'Frame: Steel', 'Cable tray: Yes', 'Surface: Carbon texture'],
    description: 'Stable gaming desk with cable management.'
  },
  {
    name: 'USB Microphone',
    slug: 'microphone',
    category: 'Audio',
    price: 149,
    stock: 11,
    image: '/assets/mic.jpg',
    modelFile: '/assets/models/mic.glb',
    rating: 4.6,
    ratingCount: 112,
    specs: ['Pattern: Cardioid', 'Sample rate: 96 kHz', 'Controls: Gain / Mute', 'Mount: Shock mount', 'Connection: USB-C'],
    description: 'USB microphone optimized for streaming and voice recording.'
  },
  {
    name: 'Webcam',
    slug: 'webcam',
    category: 'Video',
    price: 99,
    stock: 9,
    image: '/assets/webcam.jpg',
    modelFile: '/assets/models/webcam.glb',
    rating: 4.2,
    ratingCount: 75,
    specs: ['Video: 1080p', 'FPS: 60', 'Focus: Auto', 'Microphones: Dual', 'Mount: Tripod ready'],
    description: 'Full-HD webcam with autofocus and dual microphones.'
  }
];

const featuredListingsSeed = featuredProductsSeed.map((item) => ({
  title: item.name,
  slug: item.slug,
  price: item.price
}));

module.exports = {
  featuredProductsSeed,
  featuredListingsSeed
};
