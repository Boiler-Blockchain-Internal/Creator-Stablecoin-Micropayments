import type { ContentItem } from "./types";

// Mock content. Swap this for a Supabase query once the "content" table exists:
//   const { data } = await supabase.from("content").select("*");

export const content: ContentItem[] = [
  {
    id: 1,
    title: "Frames from elsewhere",
    creator: "Maya Chen",
    creatorHandle: "mayachen",
    category: "Photography",
    price: 3,
    label: "PHOTO ESSAY",
    image:
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85",
    description:
      "Twelve frames shot over a month of slow travel, with notes on light, timing, and what didn't make the cut.",
  },
  {
    id: 2,
    title: "The art of noticing",
    creator: "Theo Williams",
    creatorHandle: "theowilliams",
    category: "Writing",
    price: 0,
    label: "FIELD NOTES",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85",
    description:
      "A short essay on paying attention to small things, and how it changed the way I write.",
  },
  {
    id: 3,
    title: "Soft shapes, loud ideas",
    creator: "Amara Okafor",
    creatorHandle: "amaraokafor",
    category: "Design",
    price: 5,
    label: "DESIGN PROCESS",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=85",
    description:
      "Sketches, rejected directions, and final files from a poster series, step by step.",
  },
  {
    id: 4,
    title: "A Sunday in motion",
    creator: "Leo Martin",
    creatorHandle: "leomartin",
    category: "Photography",
    price: 2,
    label: "BEHIND THE SCENES",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=85",
    description:
      "Behind-the-scenes shots and camera settings from a one-day landscape shoot.",
  },
  {
    id: 5,
    title: "Notes to my future self",
    creator: "Nina Patel",
    creatorHandle: "ninapatel",
    category: "Writing",
    price: 0,
    label: "PERSONAL JOURNAL",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85",
    description: "Journal entries from my first year as a freelance writer.",
  },
  {
    id: 6,
    title: "Building things by hand",
    creator: "Sam Rivera",
    creatorHandle: "samrivera",
    category: "Design",
    price: 4,
    label: "STUDIO DIARY",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=85",
    description:
      "A studio diary covering tools, materials, and mistakes from a month of woodworking.",
  },
];

export const categories = ["All work", "Photography", "Writing", "Design"] as const;

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `${price.toFixed(2)} USDC`;
}
