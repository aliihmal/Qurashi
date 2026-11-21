"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const INTERACTIVE =
  "a, button, [role='button'], [role='link'], input, select, textarea, label, summary, [data-cursor]";

function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  };
}

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * Luxury custom cursor — gold dot + trailing champagne ring.
 * Only active on precise pointers (mouse/trackpad); touch devices keep native behavior.
 */
export function Cursor() {
  const finePointer = useMedia("(pointer: fine)", false);
  const reduceMotion = useMedia("(prefers-reduced-motion: reduce)", true);
  const enabled = finePointer && !reduceMotion;
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest(INTERACTIVE));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: hovering ? 56 : 36,
          height: hovering ? 56 : 36,
          borderColor: hovering ? "var(--primary)" : "color-mix(in srgb, var(--secondary) 60%, transparent)",
          backgroundColor: hovering ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "transparent",
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ width: { type: "spring", stiffness: 300, damping: 22 }, height: { type: "spring", stiffness: 300, damping: 22 }, scale: { duration: 0.15 }, opacity: { duration: 0.2 } }}
      />
      {/* Precise dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: hovering ? 0 : 5,
          height: hovering ? 0 : 5,
          backgroundColor: "var(--primary)",
          opacity: visible ? (hovering ? 0 : 0.9) : 0,
          scale: pressed ? 0.6 : 1,
        }}
        transition={{ width: { type: "spring", stiffness: 400, damping: 25 }, height: { type: "spring", stiffness: 400, damping: 25 }, scale: { duration: 0.15 }, opacity: { duration: 0.2 } }}
      />
    </>
  );
}
