"use client";

// Client context only. The server-side lookup lives in ./logo-source, which
// must never be imported from a Client Component.

import { createContext, useContext } from "react";

const LogoContext = createContext<string | null>(null);

export function LogoProvider({ logoUrl, children }: { logoUrl: string | null; children: React.ReactNode }) {
  return (
    <LogoContext.Provider value={logoUrl}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  return useContext(LogoContext);
}
