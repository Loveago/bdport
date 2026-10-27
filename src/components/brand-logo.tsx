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
 * CommonTech Monogram Mark (Stylized geometric C + T with neon emerald/cyan connectivity arcs)
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
    xs: "h-7 w-7",
    sm: "h-9 w-9",
    md: "h-10 w-10 sm:h-11 sm:w-11",
    lg: "h-12 w-12 sm:h-13 sm:w-13",
    xl: "h-14 w-14 sm:h-16 sm:w-16",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center transition-transform active:scale-95",
        sizeMap[size],
        className
      )}
      aria-label="CommonTech"
    >
      <svg
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-md transition-all duration-300 hover:drop-shadow-[0_0_14px_rgba(0,223,130,0.5)]"
      >
        <defs>
          <linearGradient id="ctMarkBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#060c18" />
            <stop offset="50%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#040812" />
          </linearGradient>
          <linearGradient id="ctMarkRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00df82" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="ctMarkEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00df82" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="ctMarkCyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#00df82" />
          </linearGradient>
          <radialGradient id="ctMarkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00df82" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Badge */}
        <rect width="128" height="128" rx="28" fill="url(#ctMarkBg)" />
        <rect
          x="1.5"
          y="1.5"
          width="125"
          height="125"
          rx="26.5"
          stroke="url(#ctMarkRim)"
          strokeWidth="1.75"
        />

        {/* Ambient Light Core */}
        <circle cx="64" cy="64" r="42" fill="url(#ctMarkGlow)" />

        {/* C Arc */}
        <path
          d="M 96 36 L 68 20 C 44 20 24 38 24 64 C 24 90 44 108 68 108 L 96 92"
          stroke="url(#ctMarkEmerald)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* T Elements */}
        <path
          d="M 50 44 L 98 44"
          stroke="url(#ctMarkCyan)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 74 44 L 74 88"
          stroke="url(#ctMarkCyan)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Connectivity Nodes */}
        <circle cx="96" cy="36" r="6" fill="#00df82" />
        <circle cx="96" cy="92" r="6" fill="#00df82" />
        <circle cx="50" cy="44" r="5" fill="#38bdf8" />
        <circle cx="74" cy="88" r="5.5" fill="#00df82" />
        <circle cx="74" cy="44" r="4.5" fill="#ffffff" />
        <circle cx="74" cy="44" r="7.5" stroke="#00df82" strokeWidth="1.5" strokeOpacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * Full Horizontal Brand Logo (Neon Mark + "CommonTech" + "STAY CONNECTED · STAY AHEAD")
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
        "inline-flex shrink-0 items-center gap-3 select-none",
        className
      )}
    >
      <BrandMark size={size} />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <span className={cn("font-black tracking-tight text-slate-900 dark:text-white", textSize)}>
            Common
          </span>
          <span
            className={cn(
              "ml-0.5 font-black tracking-tight text-[#00df82] drop-shadow-[0_0_12px_rgba(0,223,130,0.4)]",
              textSize
            )}
          >
            Tech
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "mt-1 font-bold tracking-[0.24em] text-slate-500 dark:text-slate-400 uppercase hidden sm:block",
              taglineSize
            )}
          >
            Stay Connected · Stay Ahead
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
