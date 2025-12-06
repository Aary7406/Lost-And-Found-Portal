import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { comfortaa, playfair, nunito } from './utils/fonts';
import PageTransition from '@/components/PageTransition/PageTransition';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lost and Found Portal",
  description: "Manage lost and found items efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${comfortaa.variable} ${playfair.variable} ${nunito.variable}`}>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
