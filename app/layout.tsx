import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/Navbar";
import { PortfolioProvider } from "@/context/PortfolioContext";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <PortfolioProvider>
          <Navbar />
          <main className="container mx-auto p-4">{children}</main>
          <Footer />
        </PortfolioProvider>
      </body>
    </html>
  );
}
