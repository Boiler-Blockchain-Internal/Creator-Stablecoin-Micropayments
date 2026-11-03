"use client";

import { useEffect, useState } from "react";
import type { ContentItem } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { useWallet } from "@/lib/wallet";

type Step = "details" | "paying" | "done" | "error";

type Props = {
  item: ContentItem | null;
  onClose: () => void;
};

/*
 * The unlock flow from the planning doc (Buyer > Purchasing):
 *   details → connect wallet (if needed) → pay → pending → confirmed → content unlocked
 */
export default function PurchaseModal({ item, onClose }: Props) {
  const { address, balance, connecting, connect, purchase, saveFree, owns } =
    useWallet();
  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  // Reset whenever a different item is opened
  useEffect(() => {
    setStep("details");
    setError("");
    setTxHash("");
  }, [item?.id]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  const owned = owns(item.id);
  const isFree = item.price === 0;
  const unlocked = isFree || owned;

  async function handlePay() {
    if (!item) return;
    setStep("paying");
    setError("");
    try {
      const result = await purchase(item.id, item.price);
      setTxHash(result.txHash);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-title"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#F2F0E7] text-[#171914] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[16/9] bg-[#E4E1D5]">
          <img
            src={item.image}
            alt={item.title}
            className={`h-full w-full object-cover transition duration-700 ${
              unlocked ? "" : "blur-xl"
            }`}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F0E7] text-lg"
          >
            ×
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[#68705A]">
            {item.label} · {item.category.toUpperCase()}
          </p>
          <h2 id="purchase-title" className="mt-2 text-2xl font-medium tracking-tight">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-[#747566]">by {item.creator}</p>
          <p className="mt-4 text-sm leading-6 text-[#45483C]">{item.description}</p>

          <div className="mt-6 border-t border-[#D7D6CA] pt-6">
            {/* Already unlocked */}
            {unlocked && step !== "done" && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#45483C]">
                  {owned ? "✓ This is in your library." : "This piece is free."}
                </p>
                {isFree && !owned && (
                  <button
                    onClick={() => saveFree(item.id)}
                    className="rounded-full bg-[#171914] px-5 py-3 text-sm font-semibold text-[#F2F0E7]"
                  >
                    Add to library
                  </button>
                )}
              </div>
            )}

            {/* Locked: needs wallet */}
            {!unlocked && !address && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-[#45483C]">
                  Connect a wallet to unlock for{" "}
                  <strong>{formatPrice(item.price)}</strong>.
                </p>
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="shrink-0 rounded-full bg-[#171914] px-5 py-3 text-sm font-semibold text-[#F2F0E7] disabled:opacity-60"
                >
                  {connecting ? "Connecting…" : "Connect wallet"}
                </button>
              </div>
            )}

            {/* Locked: ready to pay */}
            {!unlocked && address && step === "details" && (
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#747566]">Price</span>
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-[#747566]">Your balance</span>
                  <span>{balance.toFixed(2)} USDC</span>
                </div>
                <button
                  onClick={handlePay}
                  className="mt-5 w-full rounded-full bg-[#D5F36A] px-5 py-3 text-sm font-semibold transition hover:bg-[#e3fa91]"
                >
                  Pay {formatPrice(item.price)} & unlock
                </button>
                <p className="mt-3 text-center text-xs text-[#858576]">
                  Testnet demo · no real money moves
                </p>
              </div>
            )}

            {step === "paying" && (
              <div className="flex items-center gap-3 text-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#171914] border-t-transparent" />
                Waiting for payment confirmation…
              </div>
            )}

            {step === "done" && (
              <div className="text-sm">
                <p className="font-semibold">✓ Unlocked. Enjoy.</p>
                <p className="mt-2 break-all font-mono text-xs text-[#747566]">
                  Tx: {txHash}
                </p>
              </div>
            )}

            {step === "error" && (
              <div className="text-sm">
                <p className="text-[#A23B2A]">{error}</p>
                <button
                  onClick={() => setStep("details")}
                  className="mt-3 underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
