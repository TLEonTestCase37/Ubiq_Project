"use client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 drop-shadow-lg">🎯 Verification Dashboard</h1>
      <p className="text-lg text-white/80 mb-10 text-center max-w-md">
        Welcome! Choose an action below to verify, register, or scan users.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        <button
          onClick={() => router.push("/dashboard/scan-qr")}
          className="p-6 rounded-2xl bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg transition transform hover:scale-105"
        >
          📱 Scan QR
          <p className="text-sm text-black/70 mt-1">Scan QR codes to fetch user data</p>
        </button>

        <button
          onClick={() => router.push("/dashboard/scan-face")}
          className="p-6 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-lg transition transform hover:scale-105"
        >
          👤 Face Scan
          <p className="text-sm text-black/70 mt-1">Identify a person using face recognition</p>
        </button>

        <button
          onClick={() => router.push("/dashboard/register")}
          className="p-6 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg transition transform hover:scale-105"
        >
          📝 Register Person
          <p className="text-sm text-white/80 mt-1">Capture or upload face to register a new person</p>
        </button>
      </div>
    </div>
  );
}
