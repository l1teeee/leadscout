"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavigationContextValue {
  isNavigating: boolean;
  navigate: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextValue>({
  isNavigating: false,
  navigate: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const currentPathRef = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      if (href !== currentPathRef.current) {
        setIsNavigating(true);
      }
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    if (pathname !== currentPathRef.current) {
      currentPathRef.current = pathname;
      setIsNavigating(false);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ isNavigating, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
