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
  taglineClassName?: string;
}

/**
 * CommonTech Minimalist Freestanding Monogram Mark
 * Clean monochrome "C" and "T" with a refined emerald accent node.
 * Zero neon glow, crisp precision geometry.
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

  const sizePixels = {
    xs: 24,
    sm: 34,
    md: 38,
    lg: 46,
    xl: 60,
  };

  const px = sizePixels[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center transition-transform hover:scale-105 active:scale-95",
        sizeMap[size],
        className
      )}
      style={{ width: px, height: px, maxWidth: "100%" }}
      aria-label="CommonTech"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        width={px}
        height={px}
        style={{ width: px, height: px, maxWidth: "100%" }}
      >
        {/* "C" Arc: Deep slate in light mode, pure white in dark mode */}
        <path
          d="M 76 25 A 35 35 0 1 0 76 75"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className="text-slate-900 dark:text-white"
        />

        {/* "T" Element: Sophisticated silver-slate */}
        <path
          d="M 42 38 L 84 38"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-slate-500 dark:text-slate-400"
        />
        <path
          d="M 63 38 L 63 68"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="text-slate-500 dark:text-slate-400"
        />

        {/* Subtle Emerald Accent Node */}
        <circle cx="63" cy="38" r="4" className="fill-emerald-600 dark:fill-emerald-400" />
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
  taglineClassName,
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
      ? "text-[10.5px]"
      : size === "lg"
      ? "text-[9.5px]"
      : size === "md"
      ? "text-[8.5px]"
      : size === "xs"
      ? "text-[6.5px]"
      : "text-[6.5px] sm:text-[8px]";

  const content = (
    <div
      className={cn(
        "inline-flex shrink-0 items-center gap-2 sm:gap-3 select-none",
        className
      )}
    >
      <BrandMark size={size} />
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center leading-none">
          <span className={cn("font-black tracking-[-0.035em] text-slate-900 dark:text-white", textSize)}>
            Common
          </span>
          <span
            className={cn(
              "ml-0.5 font-black tracking-[-0.035em] text-emerald-600 dark:text-emerald-400",
              textSize
            )}
          >
            Tech
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "mt-0.5 font-semibold uppercase tracking-[0.03em] sm:tracking-[0.14em] text-slate-400 dark:text-slate-400 block truncate max-w-[130px] xs:max-w-[160px] sm:max-w-none leading-none",
              taglineSize,
              taglineClassName
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
