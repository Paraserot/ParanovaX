
"use client";

import { useLoading } from "@/hooks/use-loading";
import { cn } from "@/lib/utils";

// This component is now being replaced by the GlobalLoader logic
// but we keep the file to avoid breaking imports if they exist.
// The actual loader is rendered in GlobalLoader.
export function PageTransitionLoader() {
  const { isLoading } = useLoading();

  return (
    <div className={cn("page-transition-loader", isLoading && "loading")}></div>
  );
}
