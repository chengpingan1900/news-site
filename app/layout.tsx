import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Global News Events",
  description: "Your daily source of global news, curated from Washington D.C.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-white text-black`}
      >
        <header className="border-b-4 border-black mb-8">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center border-b border-gray-200">
            <div className="text-xs font-sans text-gray-500 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex gap-4 text-xs font-sans font-bold uppercase tracking-wider">
              <Link href="/admin" className="hover:underline">Admin</Link>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8 text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight leading-none">
                GLOBAL NEWS EVENTS
              </h1>
            </Link>
          </div>
          <nav className="border-t border-b border-black py-3">
            <ul className="flex justify-center gap-8 font-sans text-sm font-bold uppercase tracking-widest">
              <li><Link href="/" className="hover:text-gray-600">Home</Link></li>
              <li><Link href="/category/world" className="hover:text-gray-600">World</Link></li>
              <li><Link href="/category/business" className="hover:text-gray-600">Business</Link></li>
              <li><Link href="/category/tech" className="hover:text-gray-600">Tech</Link></li>
              <li><Link href="/category/opinion" className="hover:text-gray-600">Opinion</Link></li>
              <li><Link href="/about" className="hover:text-gray-600 text-red-700">About Us</Link></li>
            </ul>
          </nav>
        </header>
        <main className="min-h-screen container mx-auto px-4 pb-16">
          {children}
        </main>
        <footer className="bg-gray-100 border-t border-gray-300 mt-12 py-12">
          <div className="container mx-auto px-4 text-center">
             <p className="font-sans text-sm text-gray-500">© {new Date().getFullYear()} The Daily News. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
