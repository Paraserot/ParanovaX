
"use client";

import { useLoading } from "@/hooks/use-loading";
import { cn } from "@/lib/utils";

export const GlobalLoader = () => {
    const { isLoading } = useLoading();
    
    return (
       <div className={cn(
            "page-transition-loader",
            isLoading && "loading"
        )} />
    )
}
