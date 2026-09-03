"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent>();

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const clearPrompt = () => setInstallPrompt(undefined);
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", clearPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", clearPrompt);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(undefined);
    }
  };

  if (!installPrompt) return null;
  return <button type="button" aria-label="安装产品图册" title="安装产品图册" onClick={() => void install()} className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-900 shadow-sm"><Download size={18} strokeWidth={1.6} /></button>;
}
