// RootLayout.tsx
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { PortfolioProvider } from "@/context/PortfolioContext";
import Footer from "@/components/Footer";
import MainNavbar from "@/components/Navbar/Navbar";
import WikiNavbar from "@/components/Navbar/NavbarWiki";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <PortfolioProvider>
          {/* Navbar entscheidet selbst, clientseitig */}
          <MainNavbar />
          {children}
          <Footer />
        </PortfolioProvider>
      </body>
    </html>
  );
}
