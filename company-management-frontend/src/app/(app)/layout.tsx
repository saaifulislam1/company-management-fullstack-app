"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Toaster } from "react-hot-toast";

// This is the main layout for the authenticated part of the application.
// It includes the sidebar, header, and the logic to protect routes.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the session is finished loading and there's no authenticated user,
    // redirect to the login page.
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // While the session is loading, we can show a loader or nothing.
  // This prevents a "flash" of the protected content before the redirect happens.
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If the user is authenticated, render the full application layout.
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex-col">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </div>
  );
}
