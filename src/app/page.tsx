export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to Next.js!
        </h1>
        <p className="mt-2 text-gray-600">
          Your Tailwind setup is ready. Start building by editing{" "}
          <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-sm">
            src/app/page.tsx
          </code>
        </p>
      </div>
    </main>
  );
}
