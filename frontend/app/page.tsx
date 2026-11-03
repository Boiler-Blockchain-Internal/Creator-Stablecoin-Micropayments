"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/types";
import { categories, content } from "@/lib/mockData";
import ContentCard from "@/components/ContentCard";
import PurchaseModal from "@/components/PurchaseModal";

type PriceFilter = "all" | "free" | "paid";
type Sort = "newest" | "price-asc" | "price-desc";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All work");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [openItem, setOpenItem] = useState<ContentItem | null>(null);

  const query = search.trim().toLowerCase();

  const filteredContent = content
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query);
      const matchesCategory = category === "All work" || item.category === category;
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" ? item.price === 0 : item.price > 0);
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  function clearFilters() {
    setSearch("");
    setCategory("All work");
    setPriceFilter("all");
    setSort("newest");
  }

  return (
    <main className="min-h-screen bg-[#171914] text-[#F2F0E7]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 lg:px-10 lg:pb-24 lg:pt-28">
        <div className="grid gap-12 md:grid-cols-[1.4fr_0.6fr] md:items-end">
          <div>
            <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#D5F36A]">
              <span className="h-px w-8 bg-[#D5F36A]" />
              A home for independent work
            </p>
            <h1 className="max-w-3xl text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-8xl">
              Good work deserves
              <br />
              <span className="font-serif italic text-[#D5F36A]">to be supported.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#B9BAAE] sm:text-lg">
              Discover the things people make when they care about what they do.
              Explore original work, get closer to creators, and support what you love.
            </p>
            <a
              href="#explore"
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#656957] px-6 py-3 text-sm transition hover:border-[#D5F36A] hover:text-[#D5F36A]"
            >
              Explore the collection <span>↓</span>
            </a>
          </div>

          <div className="border-l border-[#45483C] pl-6 md:mb-2">
            <p className="text-sm leading-6 text-[#B9BAAE]">
              Independent by nature.
              <br />
              Direct by design.
            </p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#B9BAAE]">
              Pay a few cents in USDC to unlock a single piece. No subscriptions,
              and creators keep almost all of it.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-widest text-[#D5F36A]">
              <span className="h-2 w-2 rounded-full bg-[#D5F36A]" />
              Made for the curious
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section id="explore" className="bg-[#F2F0E7] text-[#171914]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#68705A]">
                The collection / 001
              </p>
              <h2 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                Work worth finding.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#626456]">
              A few things made with intention. Find your next favourite creator.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mt-10 flex flex-col gap-4 border-y border-[#D7D6CA] py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    category === item
                      ? "bg-[#171914] text-[#F2F0E7]"
                      : "border border-[#D7D6CA] text-[#45483C] hover:border-[#171914]"
                  }`}
                >
                  {item}
                </button>
              ))}

              <span className="mx-1 hidden w-px self-stretch bg-[#D7D6CA] sm:block" />

              {(["all", "free", "paid"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                    priceFilter === p
                      ? "border-[#D5F36A] bg-[#D5F36A]"
                      : "border-[#D7D6CA] hover:border-[#171914]"
                  }`}
                >
                  {p === "all" ? "Any price" : p}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search work or creators..."
                aria-label="Search work or creators"
                className="w-full rounded-full border border-[#D7D6CA] bg-transparent px-5 py-3 text-sm outline-none placeholder:text-[#858576] focus:border-[#45483C] lg:w-64"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Sort"
                className="rounded-full border border-[#D7D6CA] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#45483C]"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs uppercase tracking-widest text-[#747566]">
            <span>Selected work</span>
            <span>{filteredContent.length} pieces</span>
          </div>

          <div className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item, index) => (
              <ContentCard key={item.id} item={item} index={index} onOpen={setOpenItem} />
            ))}
          </div>

          {filteredContent.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xl">Nothing found just yet.</p>
              <p className="mt-2 text-sm text-[#747566]">Try a different search or category.</p>
              <button onClick={clearFilters} className="mt-5 underline underline-offset-4">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Creator call to action */}
      <section id="creators" className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D5F36A]">
              Your work. Your terms.
            </p>
            <h2 className="mt-5 max-w-xl text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
              Make something.
              <br />
              Let it find its people.
            </h2>
          </div>
          <div>
            <p className="max-w-lg leading-7 text-[#B9BAAE]">
              Share your process, publish your work, and let people support the things
              you create. You make the work. Your audience decides what it means to them.
            </p>
            <button
              disabled
              className="mt-7 cursor-not-allowed rounded-full bg-[#D5F36A]/70 px-6 py-3 text-sm font-semibold text-[#171914]"
            >
              Creator tools coming soon
            </button>
          </div>
        </div>
      </section>

      <footer id="about" className="border-t border-[#45483C]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-7 text-sm text-[#B9BAAE] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p className="text-lg font-bold tracking-tight text-[#F2F0E7]">
            creator support<span className="text-[#D5F36A]">.</span>
          </p>
          <p>Made for people who make things.</p>
          <p>Independent Studio · Early preview</p>
        </div>
      </footer>

      <PurchaseModal item={openItem} onClose={() => setOpenItem(null)} />
    </main>
  );
}
