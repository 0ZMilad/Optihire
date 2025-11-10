"use client";

import { cn } from "@/lib/utils";

type MainProps = React.HTMLAttributes<HTMLElement>;

export function Main({ className, ...props }: MainProps) {
  return (
    <main
      className={cn("px-4 py-6 max-w-7xl mx-auto w-full", className)}
      {...props}
    />
  );
}
