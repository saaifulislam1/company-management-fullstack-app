"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// This is the main entry point of the app.
// It acts as a gatekeeper, redirecting users based on their auth status.
export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard"); // Use replace to avoid back-button issues
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  // Display a loading indicator while checking auth status.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
