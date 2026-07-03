import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Imposztor - Ki az?",
  description: "Online multiplayer party játék mobilra és webre",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents native mobile webview zooming inside inputs
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" className="h-full">
      <body className={`${inter.className} h-full bg-slate-950 text-white antialiased overflow-x-hidden`}>
        {/* Global Cosmic ambient background layer */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-black pointer-events-none -z-10" />
        <main className="min-h-full">
          {children}
        </main>
      </body>
    </html>
  );
}