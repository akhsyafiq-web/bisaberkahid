"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
}

/** Catches render crashes and shows a friendly recovery UI. */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-4xl">😔</span>
          <div>
            <p className="font-bold text-gray-900">Ada yang tidak beres</p>
            <p className="mt-1 text-sm text-gray-500">
              Terjadi kesalahan saat menampilkan halaman ini.
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Coba lagi</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
