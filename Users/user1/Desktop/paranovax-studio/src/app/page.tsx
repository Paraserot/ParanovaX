"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { AnimatedAuthIllustration } from "@/components/animated-auth-illustration";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background">
      <AnimatedBlobs />
      <header className="absolute top-0 left-0 p-6">
        <BrandLogo />
      </header>
      
      <main className="z-10 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                Welcome to <span className="text-primary">ParanovaX</span>
              </h1>
              <p className="max-w-prose text-muted-foreground md:text-lg">
                Your all-in-one business management suite. Streamline your operations, manage clients, and track finances with ease.
              </p>
              <Button asChild size="lg" variant="border-gradient" className="text-lg">
                <Link href="/login">
                  Get Started
                </Link>
              </Button>
            </div>
            <div className="hidden md:block">
              <AnimatedAuthIllustration />
            </div>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 text-xs text-muted-foreground z-10">
        © {new Date().getFullYear()} ParanovaX. All Rights Reserved.
      </footer>
    </div>
  );
}
