"use client";

import Link from "next/link";
import type { ContentItem } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { useWallet } from "@/lib/wallet";

type Props = {
  item: ContentItem;
  index: number;
  onOpen: (item: ContentItem) => void;
};

export default function ContentCard({ item, index, onOpen }: Props) {
  const { owns } = useWallet();
  const unlocked = item.price === 0 || owns(item.id);

  return (
    <article className="group">
      <button
        onClick={() => onOpen(item)}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#E4E1D5] text-left"
        aria-label={`Open ${item.title}`}
      >
        <img
          src={item.image}
          alt={item.title}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            unlocked ? "" : "blur-md brightness-90"
          }`}
        />

        <span className="absolute left-4 top-4 bg-[#F2F0E7] px-3 py-1.5 text-[10px] font-semibold tracking-[0.15em]">
          {item.label}
        </span>

        {!unlocked && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-[#171914]/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#F2F0E7]">
              🔒 Locked
            </span>
          </span>
        )}

        <span
          className={`absolute bottom-4 right-4 rounded-full px-3 py-2 text-sm font-semibold ${
            owns(item.id)
              ? "bg-[#171914] text-[#D5F36A]"
              : "bg-[#D5F36A] text-[#171914]"
          }`}
        >
          {owns(item.id) ? "✓ In library" : formatPrice(item.price)}
        </span>
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#747566]">
            {item.category} / {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-xl font-medium tracking-tight">{item.title}</h3>
          <p className="mt-1 text-sm text-[#747566]">
            by{" "}
            <Link
              href={`/creator/${item.creatorHandle}`}
              className="underline-offset-4 hover:underline"
            >
              {item.creator}
            </Link>
          </p>
        </div>

        <button
          onClick={() => onOpen(item)}
          aria-label={`Open ${item.title}`}
          className="mt-5 text-xl transition group-hover:translate-x-1"
        >
          ↗
        </button>
      </div>
    </article>
  );
}
