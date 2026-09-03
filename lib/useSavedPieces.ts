"use client";

import { useCallback, useEffect, useState } from "react";

const storageKey = "meimih-saved-pieces";

function readSavedPieces(): string[] {
  try {
    const value = window.localStorage.getItem(storageKey);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : [];
  } catch {
    return [];
  }
}

export function useSavedPieces() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSaved(readSavedPieces());
    sync();
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleSaved = useCallback((slug: string) => {
    setSaved((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Keep the current browsing session useful when storage is unavailable.
      }
      return next;
    });
  }, []);

  const clearSaved = useCallback(() => {
    setSaved([]);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // The visible shortlist is still cleared when storage access is unavailable.
    }
  }, []);

  return { saved, toggleSaved, clearSaved, isSaved: (slug: string) => saved.includes(slug) };
}
