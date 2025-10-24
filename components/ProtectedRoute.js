"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/fireabse"; // adjust path if needed

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login"); // redirect if not logged in
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Checking authentication...
      </div>
    );
  }

  return children;
}
