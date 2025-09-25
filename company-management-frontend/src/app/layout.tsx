import type { Metadata } from "next";
// Import Poppins from next/font
import { Poppins } from "next/font/google";
import "./globals.css";

// Configure the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Include the weights you'll use
});

export const metadata: Metadata = {
  title: "Company Management System",
  description: "Manage your company with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Apply the font class to the body */}
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
