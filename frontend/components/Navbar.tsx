"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { shortAddress, useWallet } from "@/lib/wallet";

const links = [
  { href: "/#explore", label: "Explore" },
  { href: "/library", label: "My library" },
  { href: "/#creators", label: "For creators" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, balance, connecting, connect, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-[#45483C]/60 bg-[#171914] text-[#F2F0E7]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          creator support<span className="text-[#D5F36A]">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-[#B9BAAE] md:flex">
          {links.map((link) => {
            const active =
              link.href === "/library" ? pathname === "/library" : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "text-[#D5F36A]" : "transition hover:text-white"}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {address ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-3 rounded-full border border-[#45483C] px-4 py-2 text-sm transition hover:border-[#D5F36A]"
            >
              <span className="h-2 w-2 rounded-full bg-[#D5F36A]" />
              <span className="font-mono">{shortAddress(address)}</span>
              <span className="hidden text-[#B9BAAE] sm:inline">
                {balance.toFixed(2)} USDC
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-[#45483C] bg-[#20231C] p-2 text-sm shadow-xl">
                <Link
                  href="/library"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2 hover:bg-[#2B2E25]"
                >
                  Library & history
                </Link>
                <button
                  onClick={() => {
                    disconnect();
                    setMenuOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-[#B9BAAE] hover:bg-[#2B2E25]"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={connecting}
            className="rounded-full bg-[#D5F36A] px-5 py-2.5 text-sm font-semibold text-[#171914] transition hover:bg-[#e3fa91] disabled:opacity-60"
          >
            {connecting ? "Connecting…" : "Connect wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
