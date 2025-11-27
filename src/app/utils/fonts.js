// Optimized fonts configuration for Lost and Found Portal
import { Comfortaa, Playfair_Display } from 'next/font/google';

// Primary font for headings and UI
export const comfortaa = Comfortaa({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comfortaa',
  preload: true,
});

// For elegant/decorative text in features
export const playfair = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true,
});