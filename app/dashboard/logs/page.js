"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const router = useRouter();

  // 🧾 List of allowed admin emails
  const ADMIN_EMAILS = ["amankumarsingh2904@gmail.com", "staff@college.edu"]; // change this

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        if (ADMIN_EMAILS.includes(user.email)) {
          setIsAdmin(true);
          await fetchLogs(); // only fetch if admin
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Fetch the 100 most recent logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔒 Not logged in or not admin
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white text-lg">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white">
        <h1 className="text-3xl font-bold mb-4">🚫 Access Denied</h1>
        <p className="text-white/70 mb-6">
          You don’t have permission to view this page.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg shadow hover:bg-yellow-500 transition"
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    );
  }

  // ✅ Admin view: show logs
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center drop-shadow-lg">
        📊 Recent Scan Logs
      </h1>
      <div className="overflow-x-auto bg-white/10 rounded-xl shadow-lg max-w-5xl mx-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-white/20 text-sm text-white uppercase">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Scanner Email</th>
              <th className="px-4 py-3 text-left">Scan Type</th>
              <th className="px-4 py-3 text-left">Matched Name</th>
              <th className="px-4 py-3 text-left">Matched Email</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-white/60 text-lg"
                >
                  No logs found.
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr
                  key={log.id}
                  className={`text-sm border-t border-white/10 ${
                    index % 2 === 0 ? "bg-white/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{log.scanner_email}</td>
                  <td className="px-4 py-3 capitalize">{log.scan_type}</td>
                  <td className="px-4 py-3">{log.matched_name || "-"}</td>
                  <td className="px-4 py-3">{log.matched_email || "-"}</td>
                  <td className="px-4 py-3">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
