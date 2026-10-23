import type { ReactNode } from "react";

/** Compact sticky per-tab title bar. */
export const TopBar = ({ children }: { children: ReactNode }) => (
  <header className="sticky top-0 z-[1050] border-b border-slate-200 bg-slate-50/95 pt-[env(safe-area-inset-top)] backdrop-blur">
    <div className="mx-auto flex min-h-12 max-w-3xl items-center justify-between gap-2 px-4">{children}</div>
  </header>
);

export const TopTitle = ({ children }: { children: ReactNode }) => <h1 className="truncate text-lg font-bold">{children}</h1>;
