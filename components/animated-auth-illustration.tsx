import Image from "next/image";
import { DollarSign, Landmark, Plane, Globe, Briefcase } from "lucide-react";

export function AnimatedAuthIllustration() {
  const icons = [
    { icon: DollarSign, className: "top-1/4 left-10", style: { animationDelay: '0s' } },
    { icon: Landmark, className: "top-10 right-10", style: { animationDelay: '-2s' } },
    { icon: Plane, className: "bottom-10 left-16", style: { animationDelay: '-4s' } },
    { icon: Globe, className: "bottom-1/3 right-12", style: { animationDelay: '-6s' } },
    { icon: Briefcase, className: "top-1/2 -left-4", style: { animationDelay: '-8s' } },
    { icon: DollarSign, className: "bottom-1/4 -right-2", style: { animationDelay: '-10s' } },
  ];

  return (
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
      {/* Central Image */}
      <Image
        src="https://i.pinimg.com/1200x/fb/fc/52/fbfc522166c64c340ca6bc47b2c585f2.jpg"
        alt="ParanovaX Logo"
        width={200}
        height={200}
        className="rounded-lg object-contain"
        data-ai-hint="abstract logo"
        priority
      />

      {/* Orbiting Icons */}
      {icons.map((item, index) => {
        const Icon = item.icon;
        return (
            <div
                key={index}
                className={`orbiting-icon absolute z-20 ${item.className}`}
                style={item.style}
            >
                <div className="flex items-center justify-center w-12 h-12 bg-card/80 backdrop-blur-sm rounded-full shadow-lg border">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        );
      })}
    </div>
  );
}
