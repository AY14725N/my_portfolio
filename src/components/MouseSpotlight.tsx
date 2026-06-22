"use client";

import { useEffect, useRef } from "react";

export default function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.background = `radial-gradient(500px at ${e.clientX}px ${e.clientY}px, rgba(200, 165, 90, 0.03), transparent 80%)`;
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-30" />;
}
