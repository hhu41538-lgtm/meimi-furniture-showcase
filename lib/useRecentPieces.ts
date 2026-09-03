"use client";

import { useCallback, useEffect, useState } from "react";

const storageKey = "meimih-recent-pieces";
const maximumRecentPieces = 6;

function readRecentPieces(): string[] {
  try {
    const value = window.localStorage.getItem(storageKey);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

export function useRecentPieces() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setRecent(readRecentPieces());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const recordRecent = useCallback((slug: string) => {
    setRecent((current) => {
      const next = [slug, ...current.filter((item) => item !== slug)].slice(0, maximumRecentPieces);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Recent navigation remains available until the page closes when storage is unavailable.
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // The in-memory list is still cleared when storage access is unavailable.
    }
  }, []);

  return { recent, recordRecent, clearRecent };
}
