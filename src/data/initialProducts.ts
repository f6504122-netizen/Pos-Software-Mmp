import { Product } from '../types';

// Clean out of the box catalog for new user
export const INITIAL_PRODUCTS: Product[] = [];

// Standard rack tiers available if new user wants to generate quick card codes A through F
export const STANDARD_CARD_RACK_PRESETS: Product[] = [
  {
    id: 'pc-tier-a',
    name: 'Card Code A (Standard)',
    category: 'price-codes',
    price: 2.99,
    barcode: 'CODE-A',
    code: 'Tier A',
    icon: '✉️',
    stock: 100,
  },
  {
    id: 'pc-tier-b',
    name: 'Card Code B (Embossed)',
    category: 'price-codes',
    price: 3.99,
    barcode: 'CODE-B',
    code: 'Tier B',
    icon: '💌',
    stock: 100,
  },
  {
    id: 'pc-tier-c',
    name: 'Card Code C (Foil/Glitter)',
    category: 'price-codes',
    price: 4.99,
    barcode: 'CODE-C',
    code: 'Tier C',
    icon: '✨',
    stock: 100,
  },
  {
    id: 'pc-tier-d',
    name: 'Card Code D (3D Pop-Up)',
    category: 'price-codes',
    price: 5.99,
    barcode: 'CODE-D',
    code: 'Tier D',
    icon: '🌟',
    stock: 100,
  },
  {
    id: 'pc-tier-e',
    name: 'Card Code E (Musical)',
    category: 'price-codes',
    price: 7.99,
    barcode: 'CODE-E',
    code: 'Tier E',
    icon: '🎵',
    stock: 100,
  },
  {
    id: 'pc-tier-f',
    name: 'Card Code F (Wood Keepsake)',
    category: 'price-codes',
    price: 9.99,
    barcode: 'CODE-F',
    code: 'Tier F',
    icon: '🪵',
    stock: 100,
  },
];
