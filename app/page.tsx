import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen p-10 bg-background text-foreground">
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>

      <h1 className="text-4xl font-bold">
        Trading Journal
      </h1>

      <p className="mt-4 text-gray-500">
        Track your trades, strategies, tags and performance.
      </p>
    </main>
  );
}