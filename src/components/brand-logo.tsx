"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  variant?: "default" | "dark" | "light";
}

/**
 * CommonTech Precision Monogram Mark
 * Radiant cyber-emerald & hyper-cyan squircle badge with an iconic dark CT monogram
 */
export function BrandMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dark" | "light";
}) {
  const sizeMap = {
    xs: "h-7 w-7 rounded-lg",
    sm: "h-9 w-9 sm:h-10 sm:w-10 rounded-xl",
    md: "h-11 w-11 sm:h-12 sm:w-12 rounded-2xl",
    lg: "h-14 w-14 sm:h-15 sm:w-15 rounded-2xl",
    xl: "h-16 w-16 sm:h-20 sm:w-20 rounded-3xl",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-tr from-[#00df82] via-[#00f59b] to-[#06b6d4] shadow-md shadow-[#00df82]/30 ring-1 ring-white/30 transition-all duration-200 active:scale-95 hover:shadow-lg hover:shadow-[#00df82]/40",
        sizeMap[size],
        className
      )}
      aria-label="CommonTech"
    >
      {/* 3D Gloss Sheen Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-90" />

      {/* The Precision "CT" Monogram Glyph */}
      <svg
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-full w-full p-[14%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
      >
        {/* Bold C Arc */}
        <path
          d="M 94 36 A 34 34 0 1 0 94 92"
          fill="none"
          stroke="#060d19"
          strokeWidth="15"
          strokeLinecap="round"
        />

        {/* Bold T Crossbar & Pillar */}
        <path
          d="M 52 48 L 96 48"
          fill="none"
          stroke="#060d19"
          strokeWidth="13.5"
          strokeLinecap="round"
        />
        <path
          d="M 74 48 L 74 84"
          fill="none"
          stroke="#060d19"
          strokeWidth="13.5"
          strokeLinecap="round"
        />

        {/* Central High-Speed Telecom Pulse Beacon */}
        <circle cx="74" cy="48" r="4" fill="#00DF82" />
      </svg>
    </div>
  );
}

/**
 * Full Horizontal Brand Logo (Neon Mark + "CommonTech" + "EMPOWERING DIGITAL CONNECTIVITY")
 */
export function BrandLogo({
  className,
  size = "md",
  showTagline = true,
  href,
}: BrandProps) {
  const textSize =
    size === "xl"
      ? "text-2xl sm:text-3xl"
      : size === "lg"
      ? "text-xl sm:text-2xl"
      : size === "md"
      ? "text-lg sm:text-xl"
      : size === "xs"
      ? "text-xs sm:text-sm"
      : "text-base sm:text-lg";

  const taglineSize =
    size === "xl"
      ? "text-[10px]"
      : size === "lg"
      ? "text-[9px]"
      : size === "md"
      ? "text-[8px]"
      : size === "xs"
      ? "text-[6px]"
      : "text-[7.5px]";

  const content = (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 sm:gap-3 select-none",
        className
      )}
    >
      <BrandMark size={size} />
      <div className="flex flex-col justify-center">
        <div className="flex items-center leading-none">
          <span className={cn("font-black tracking-[-0.03em] text-slate-900 dark:text-white", textSize)}>
            Common
          </span>
          <span
            className={cn(
              "ml-0.5 font-black tracking-[-0.03em] text-[#00df82] drop-shadow-[0_0_12px_rgba(0,223,130,0.5)]",
              textSize
            )}
          >
            Tech
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "mt-1 font-bold tracking-[0.22em] text-slate-400 dark:text-slate-400 uppercase hidden sm:block",
              taglineSize
            )}
          >
            Empowering Digital Connectivity
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex transition-transform hover:scale-[1.02] active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
}
