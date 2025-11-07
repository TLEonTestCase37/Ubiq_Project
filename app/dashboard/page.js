"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Define which email(s) should see the Logs button
  const ADMIN_EMAILS = ["amankumarsingh2904@gmail.com", "staff@college.edu"]; // <-- change to your desired ones

  const isAdmin = ADMIN_EMAILS.includes(userEmail);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-lg">
        Checking access...
      </div>
    );
  }

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

        {/* 🔹 Render only if user is an admin */}
        {isAdmin && (
          <button
            onClick={() => router.push("/dashboard/logs")}
            className="p-6 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-lg transition transform hover:scale-105"
          >
            📊 View Logs
            <p className="text-sm text-white/80 mt-1">See all scan & registration logs</p>
          </button>
        )}
      </div>
    </div>
  );
}
