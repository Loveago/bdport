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
 * CommonTech Freestanding Monogram Mark
 * Luminous cyber-emerald "C" arc interlocking with an electric-cyan "T" crossbar & stem.
 * Pure vector glyph — no background box or square.
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
    xs: "h-6 w-6",
    sm: "h-8 w-8 sm:h-9 sm:w-9",
    md: "h-9 w-9 sm:h-10 sm:w-10",
    lg: "h-11 w-11 sm:h-12 sm:w-12",
    xl: "h-14 w-14 sm:h-16 sm:w-16",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center transition-transform hover:scale-105 active:scale-95",
        sizeMap[size],
        className
      )}
      aria-label="CommonTech"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_0_10px_rgba(0,223,130,0.45)]"
      >
        <defs>
          <linearGradient id="ctBrandEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FF9D" />
            <stop offset="60%" stopColor="#00DF82" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="ctBrandCyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C4FF" />
            <stop offset="50%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#00DF82" />
          </linearGradient>
          <filter id="ctBrandGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
        </defs>

        {/* Ambient Core Glow */}
        <circle cx="50" cy="50" r="30" fill="#00DF82" opacity="0.3" filter="url(#ctBrandGlow)" />

        {/* "C" Arc: Bold 13px continuous 270-degree curve */}
        <path
          d="M 76 25 A 35 35 0 1 0 76 75"
          fill="none"
          stroke="url(#ctBrandEmerald)"
          strokeWidth="13"
          strokeLinecap="round"
        />

        {/* "T" Element: Crossbar & Stem */}
        <path
          d="M 42 38 L 84 38"
          fill="none"
          stroke="url(#ctBrandCyan)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M 63 38 L 63 68"
          fill="none"
          stroke="url(#ctBrandCyan)"
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Luminous Apex Node */}
        <circle cx="63" cy="38" r="4" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * Full Horizontal Brand Logo (Freestanding Mark + "CommonTech" + "EMPOWERING DIGITAL CONNECTIVITY")
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
      : "text-lg sm:text-xl";

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
          <span className={cn("font-black tracking-[-0.04em] text-slate-900 dark:text-white", textSize)}>
            Common
          </span>
          <span
            className={cn(
              "ml-0.5 font-black tracking-[-0.04em] text-[#00df82] drop-shadow-[0_0_12px_rgba(0,223,130,0.4)]",
              textSize
            )}
          >
            Tech
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "mt-1 font-bold tracking-[0.2em] text-slate-400 dark:text-slate-400 uppercase hidden sm:block",
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
