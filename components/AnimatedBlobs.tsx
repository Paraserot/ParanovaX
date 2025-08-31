
"use client";

import { cn } from "@/lib/utils";

const blobs = [
  {
    className: "w-64 h-64 md:w-96 md:h-96 top-[-50px] left-[-150px]",
    colorClass: "bg-pink-500",
    animation: "animate-blob-1",
  },
  {
    className: "w-56 h-56 md:w-80 md:h-80 top-[-100px] right-[-100px]",
    colorClass: "bg-purple-500",
    animation: "animate-blob-2",
  },
  {
    className: "w-52 h-52 md:w-72 md:h-72 bottom-[-120px] left-[20%]",
    colorClass: "bg-teal-400",
    animation: "animate-blob-3",
  },
  {
    className: "w-64 h-64 md:w-96 md:h-96 bottom-[-50px] right-[-120px]",
    colorClass: "bg-indigo-500",
    animation: "animate-blob-4",
  },
];

export function AnimatedBlobs() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-50 h-screen w-full"
    >
      <div className="relative h-full w-full">
        {blobs.map((blob, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full opacity-50 mix-blend-screen blur-2xl filter",
              blob.className,
              blob.colorClass,
              blob.animation
            )}
          />
        ))}
      </div>
    </div>
  );
}
