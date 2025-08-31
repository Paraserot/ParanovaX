
import { cn } from "@/lib/utils";

export const CustomLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
        <div className="w-full max-w-sm">
            <div className="custom-loader-line h-1.5 w-full rounded-full" />
        </div>
    </div>
  );
};
