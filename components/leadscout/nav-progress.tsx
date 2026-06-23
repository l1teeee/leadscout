"use client";
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/contexts/navigation-context";

export function NavProgress() {
  const { isNavigating } = useNavigation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const t1 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t2 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t3 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t4 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(t1.current);
    clearTimeout(t2.current);
    clearTimeout(t3.current);
    clearTimeout(t4.current);

    if (isNavigating) {
      setVisible(true);
      setWidth(0);
      t1.current = setTimeout(() => setWidth(30), 30);
      t2.current = setTimeout(() => setWidth(60), 300);
      t3.current = setTimeout(() => setWidth(85), 900);
    } else {
      setWidth(100);
      t1.current = setTimeout(() => setVisible(false), 350);
      t2.current = setTimeout(() => setWidth(0), 400);
    }

    return () => {
      clearTimeout(t1.current);
      clearTimeout(t2.current);
      clearTimeout(t3.current);
      clearTimeout(t4.current);
    };
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: `${width}%`,
        background: "var(--text)",
        transition: isNavigating ? "width 350ms ease-out" : "width 180ms ease-out, opacity 180ms ease-in 180ms",
        zIndex: 9999,
        pointerEvents: "none",
        boxShadow: "0 0 6px var(--text)",
      }}
    />
  );
}
