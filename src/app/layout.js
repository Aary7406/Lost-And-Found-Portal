import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { comfortaa, playfair } from './utils/fonts';

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
    <html lang="en" className={`${comfortaa.variable} ${playfair.variable}`}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
