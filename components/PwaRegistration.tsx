"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isLocalDevelopment) {
      navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister()));
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}
