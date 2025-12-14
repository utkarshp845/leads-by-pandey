"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "base" | "elevated" | "glow";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, variant = "base", hover = false, onClick }: CardProps) {
  const baseClasses = "bg-gradient-to-br from-gray-800/98 to-gray-900/98 backdrop-blur-md rounded-2xl border transition-all duration-200";
  
  const variantClasses = {
    base: "border-gray-700/50",
    elevated: "border-gray-700/50 shadow-xl",
    glow: "border-2 border-yellow-500/30 shadow-glow",
  };

  const hoverClasses = hover ? "hover-lift cursor-pointer" : "";

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

