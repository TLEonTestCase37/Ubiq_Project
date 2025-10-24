import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex w-full max-w-md flex-col items-center justify-center bg-white dark:bg-black p-16 rounded-lg shadow-lg">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6 text-center">
          Welcome! Please log in to continue.
        </h1>
        <a
          href="/login"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition text-center"
        >
          🔑 Login
        </a>
      </main>
    </div>
  );
}
