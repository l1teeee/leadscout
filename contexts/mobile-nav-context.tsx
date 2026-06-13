"use client";
import { createContext, useContext, useState } from "react";

interface MobileNavContextValue {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextValue>({
  isMobileNavOpen: false,
  setIsMobileNavOpen: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ isMobileNavOpen, setIsMobileNavOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  return useContext(MobileNavContext);
}
