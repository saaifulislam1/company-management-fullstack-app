import React from "react";

/**
 * @layout AuthLayout
 * @description A simple layout component that centers its children.
 * This will be used for all authentication pages like login, register, etc.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
      {children}
    </main>
  );
}
