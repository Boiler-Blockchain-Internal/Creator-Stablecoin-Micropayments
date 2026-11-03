"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { content, formatPrice } from "@/lib/mockData";
import { shortAddress, useWallet } from "@/lib/wallet";
import ContentCard from "@/components/ContentCard";
import PurchaseModal from "@/components/PurchaseModal";

// Buyer: "view Transaction History", "view Purchased Media History",
// "view Personal Library of Saved Media" from the planning doc.

type Tab = "library" | "history";

export default function LibraryPage() {
  const { address, balance, library, purchases, connect, connecting } = useWallet();
  const [tab, setTab] = useState<Tab>("library");
  const [openItem, setOpenItem] = useState<ContentItem | null>(null);

  const owned = content.filter((item) => library.includes(item.id));
  const totalSpent = purchases
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="min-h-screen bg-[#F2F0E7] text-[#171914]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#68705A]">
          Your space
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">My library</h1>

        {!address ? (
          <div className="mt-12 rounded-3xl border border-[#D7D6CA] p-10 text-center">
            <p className="text-xl">Connect a wallet to see your library.</p>
            <p className="mt-2 text-sm text-[#747566]">
              Everything you unlock or save shows up here.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="mt-6 rounded-full bg-[#171914] px-6 py-3 text-sm font-semibold text-[#F2F0E7] disabled:opacity-60"
            >
              {connecting ? "Connecting…" : "Connect wallet"}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Stat label="Wallet" value={shortAddress(address)} mono />
              <Stat label="Balance" value={`${balance.toFixed(2)} USDC`} />
              <Stat label="Total spent" value={`${totalSpent.toFixed(2)} USDC`} />
            </div>

            {/* Tabs */}
            <div className="mt-10 flex gap-2 border-b border-[#D7D6CA]">
              {(
                [
                  ["library", `Library (${owned.length})`],
                  ["history", `Transactions (${purchases.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`-mb-px border-b-2 px-4 py-3 text-sm transition ${
                    tab === key
                      ? "border-[#171914] font-semibold"
                      : "border-transparent text-[#747566] hover:text-[#171914]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "library" &&
              (owned.length === 0 ? (
                <Empty text="Nothing here yet. Unlock or save something from Explore." />
              ) : (
                <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {owned.map((item, i) => (
                    <ContentCard key={item.id} item={item} index={i} onOpen={setOpenItem} />
                  ))}
                </div>
              ))}

            {tab === "history" &&
              (purchases.length === 0 ? (
                <Empty text="No transactions yet." />
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-widest text-[#747566]">
                      <tr>
                        <th className="py-3 font-normal">Item</th>
                        <th className="py-3 font-normal">Date</th>
                        <th className="py-3 font-normal">Amount</th>
                        <th className="py-3 font-normal">Status</th>
                        <th className="py-3 font-normal">Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => {
                        const item = content.find((c) => c.id === p.itemId);
                        return (
                          <tr key={p.id} className="border-t border-[#D7D6CA]">
                            <td className="py-4 pr-4">{item?.title ?? "Unknown item"}</td>
                            <td className="py-4 pr-4 text-[#747566]">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 pr-4">{formatPrice(p.amount)}</td>
                            <td className="py-4 pr-4">
                              <StatusPill status={p.status} />
                            </td>
                            <td className="py-4 font-mono text-xs text-[#747566]">
                              {shortAddress(p.txHash)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
          </>
        )}
      </div>

      <PurchaseModal item={openItem} onClose={() => setOpenItem(null)} />
    </main>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#D7D6CA] p-5">
      <p className="text-xs uppercase tracking-widest text-[#747566]">{label}</p>
      <p className={`mt-2 text-xl ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-[#D5F36A] text-[#171914]",
    pending: "bg-[#E4E1D5] text-[#45483C]",
    failed: "bg-[#F3D5CF] text-[#A23B2A]",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-16 text-center text-[#747566]">{text}</p>;
}
