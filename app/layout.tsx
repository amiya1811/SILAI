import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "SILAI | Custom Made. Delivered Home.",
  description:
    "Discover trusted tailors, compare stitching prices, customize your design with AI Try-On, and get your finished outfit delivered to your doorstep.",
  icons: {
    icon: "/silai-logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-wine text-champagne selection:bg-burgundy selection:text-sand">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
