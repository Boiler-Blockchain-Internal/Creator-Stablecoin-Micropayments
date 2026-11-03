import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/wallet";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Creator Support",
  description: "Support creators with small stablecoin payments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#171914]">
        <WalletProvider>
          <Navbar />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
