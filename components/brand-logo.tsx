
import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  isMobile?: boolean;
  isExpanded?: boolean;
};

export const BrandLogo = ({ isMobile = false, isExpanded = true }: BrandLogoProps) => {
    if (isMobile) {
        return (
            <Image
                src="https://i.pinimg.com/1200x/fb/fc/52/fbfc522166c64c340ca6bc47b2c585f2.jpg"
                alt="ParanovaX Logo"
                width={36}
                height={36}
                className="rounded-lg"
                priority
            />
        )
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Image
                src="https://i.pinimg.com/1200x/fb/fc/52/fbfc522166c64c340ca6bc47b2c585f2.jpg"
                alt="ParanovaX Logo"
                width={40}
                height={40}
                className="rounded-lg"
                priority
            />
            {isExpanded && (
              <span className={cn("text-2xl font-bold text-foreground")}>Paranova<span className="text-primary">X</span></span>
            )}
        </div>
    );
};
