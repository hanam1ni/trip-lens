import type { ReactNode } from "react";

/** Compact sticky per-tab title bar. */
export const TopBar = ({ children }: { children: ReactNode }) => (
  <header className="sticky top-0 z-[1050] bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
    <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-2 px-4">{children}</div>
  </header>
);

export const TopTitle = ({ children }: { children: ReactNode }) => <h1 className="truncate text-[28px] font-extrabold tracking-tight">{children}</h1>;
