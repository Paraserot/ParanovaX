"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <header className="absolute top-4 right-4">
        <Link
          href="/login"
          className="px-4 py-2 rounded-xl bg-purple-600 text-white font-medium shadow-md hover:bg-purple-700 transition"
        >
          Login
        </Link>
      </header>
      <main className="text-center">
        <h1 className="text-3xl font-bold text-purple-800">
          Welcome to ParanovaX
        </h1>
      </main>
    </div>
  );
}
