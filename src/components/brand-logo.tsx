"use client";

import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrandProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  variant?: "default" | "dark" | "light";
}

/**
 * Neon Bolt Icon / Mark (Glowing neon emerald rounded badge with stylized lightning bolt)
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
    sm: "h-9 w-9 rounded-xl",
    md: "h-10 w-10 sm:h-11 sm:w-11 rounded-2xl",
    lg: "h-12 w-12 sm:h-13 sm:w-13 rounded-2xl",
    xl: "h-14 w-14 sm:h-16 sm:w-16 rounded-3xl",
  };

  const iconSizeMap = {
    xs: "h-4 w-4",
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
    xl: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-tr from-[#00df82] via-[#00f59b] to-[#22d3ee] shadow-lg shadow-[#00df82]/30 transition-transform active:scale-95",
        sizeMap[size],
        className
      )}
      aria-label="Bundle Portal"
    >
      {/* Glossy overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-80" />
      <Zap
        className={cn(
          "relative z-10 text-slate-950 fill-slate-950 transform -rotate-6 drop-shadow-sm",
          iconSizeMap[size]
        )}
      />
    </div>
  );
}

/**
 * Full Horizontal Brand Logo (Neon Mark + "Bundle Portal" + "STAY CONNECTED · STAY AHEAD")
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
            Bundle
          </span>
          <span
            className={cn(
              "ml-1 font-black tracking-tight text-[#00df82] drop-shadow-[0_0_12px_rgba(0,223,130,0.4)]",
              textSize
            )}
          >
            Portal
          </span>
        </div>
        {showTagline && (
          <span
            className={cn(
              "mt-1 font-bold tracking-[0.24em] text-slate-500 dark:text-slate-400 uppercase",
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
