"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { content } from "@/lib/mockData";
import ContentCard from "@/components/ContentCard";
import PurchaseModal from "@/components/PurchaseModal";

// Creator profile page: /creator/mayachen
// Later this reads from a Supabase "profiles" table by handle.

export default function CreatorPage() {
  const { handle } = useParams<{ handle: string }>();
  const [openItem, setOpenItem] = useState<ContentItem | null>(null);

  const works = content.filter((item) => item.creatorHandle === handle);
  const creatorName = works[0]?.creator;

  if (!creatorName) {
    return (
      <main className="min-h-screen bg-[#F2F0E7] px-6 py-24 text-center text-[#171914]">
        <p className="text-xl">We couldn&apos;t find that creator.</p>
        <Link href="/#explore" className="mt-4 inline-block underline underline-offset-4">
          Back to explore
        </Link>
      </main>
    );
  }

  const initials = creatorName
    .split(" ")
    .map((n) => n[0])
    .join("");
  const paidCount = works.filter((w) => w.price > 0).length;

  return (
    <main className="min-h-screen bg-[#F2F0E7] text-[#171914]">
      <section className="bg-[#171914] text-[#F2F0E7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-14 sm:flex-row sm:items-end lg:px-10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#D5F36A] text-3xl font-semibold text-[#171914]">
            {initials}
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#B9BAAE]">@{handle}</p>
            <h1 className="mt-1 text-4xl font-medium tracking-tight sm:text-5xl">
              {creatorName}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-xs uppercase tracking-widest text-[#D5F36A]">
              <span className="h-2 w-2 rounded-full bg-[#D5F36A]" />
              Verified creator
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-2xl">{works.length}</p>
              <p className="text-[#B9BAAE]">pieces</p>
            </div>
            <div>
              <p className="text-2xl">{paidCount}</p>
              <p className="text-[#B9BAAE]">paid</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((item, i) => (
            <ContentCard key={item.id} item={item} index={i} onOpen={setOpenItem} />
          ))}
        </div>
      </div>

      <PurchaseModal item={openItem} onClose={() => setOpenItem(null)} />
    </main>
  );
}
