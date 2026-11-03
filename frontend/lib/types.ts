// Shared types. When the backend team sets up Supabase, these should match
// the table columns so the frontend can swap mock data for real queries.

export type Category = "Photography" | "Writing" | "Design";

export type ContentItem = {
  id: number;
  title: string;
  creator: string;
  creatorHandle: string;
  category: Category;
  price: number; // in USDC (0 = free)
  label: string;
  image: string;
  description: string;
};

export type PurchaseStatus = "pending" | "confirmed" | "failed";

export type Purchase = {
  id: string;
  itemId: number;
  amount: number;
  txHash: string;
  status: PurchaseStatus;
  createdAt: string; // ISO date
};
