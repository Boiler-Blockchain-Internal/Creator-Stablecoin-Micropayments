"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Purchase } from "./types";

/*
 * WalletProvider: one place that holds wallet + purchase state for the whole app.
 *
 * Right now everything is MOCKED so the frontend works without a backend:
 *   - connect() fakes a wallet address
 *   - purchase() fakes a transaction that confirms after ~1.5s
 *   - purchases are saved in localStorage
 *
 * When the backend/wallet team is ready, only the three functions marked
 * "TODO(backend)" need to change. Components don't need to know.
 */

type WalletContextValue = {
  address: string | null;
  balance: number;
  connecting: boolean;
  purchases: Purchase[];
  library: number[]; // item ids the user owns (bought or saved free)
  connect: () => Promise<void>;
  disconnect: () => void;
  purchase: (itemId: number, amount: number) => Promise<Purchase>;
  saveFree: (itemId: number) => void;
  owns: (itemId: number) => boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "creator-support-wallet-v1";

function randomHex(length: number) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(25); // mock testnet USDC
  const [connecting, setConnecting] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [library, setLibrary] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved state once on the client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setAddress(data.address ?? null);
        setBalance(data.balance ?? 25);
        setPurchases(data.purchases ?? []);
        setLibrary(data.library ?? []);
      }
    } catch {
      // storage blocked or corrupted: start fresh
    }
    setLoaded(true);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ address, balance, purchases, library })
      );
    } catch {
      // ignore
    }
  }, [address, balance, purchases, library, loaded]);

  // TODO(backend): replace with Circle Programmable Wallets sign-in
  const connect = useCallback(async () => {
    setConnecting(true);
    await wait(800);
    setAddress(`0x${randomHex(40)}`);
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  // TODO(backend): replace with a real USDC transfer, then have the backend
  // verify the transaction on-chain before granting access. The frontend
  // should only unlock when the backend says the purchase is confirmed.
  const purchase = useCallback(
    async (itemId: number, amount: number) => {
      if (!address) throw new Error("Connect a wallet first.");
      if (amount > balance) throw new Error("Not enough USDC in this wallet.");

      const pending: Purchase = {
        id: randomHex(12),
        itemId,
        amount,
        txHash: `0x${randomHex(64)}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setPurchases((prev) => [pending, ...prev]);

      await wait(1500); // pretend we're waiting for the chain

      const confirmed: Purchase = { ...pending, status: "confirmed" };
      setPurchases((prev) =>
        prev.map((p) => (p.id === pending.id ? confirmed : p))
      );
      setBalance((b) => Math.round((b - amount) * 100) / 100);
      setLibrary((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
      return confirmed;
    },
    [address, balance]
  );

  // TODO(backend): save to a "library" table in Supabase
  const saveFree = useCallback((itemId: number) => {
    setLibrary((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  }, []);

  const owns = useCallback((itemId: number) => library.includes(itemId), [library]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        connecting,
        purchases,
        library,
        connect,
        disconnect,
        purchase,
        saveFree,
        owns,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
