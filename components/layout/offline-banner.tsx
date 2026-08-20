"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/** Shows a banner when the browser goes offline; auto-hides on reconnect. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning-500 py-1.5 text-center text-sm font-medium text-white">
      <WifiOff className="size-4" /> Tidak ada koneksi internet
    </div>
  );
}
