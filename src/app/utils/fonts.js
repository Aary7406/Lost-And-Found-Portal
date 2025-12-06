// Optimized fonts configuration for Lost and Found Portal
import { Comfortaa, Playfair_Display, Nunito } from 'next/font/google';

// Primary font for headings and UI - rounded geometric
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

// Rounded sans-serif for student dashboard - friendly and readable
export const nunito = Nunito({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  preload: true,
});