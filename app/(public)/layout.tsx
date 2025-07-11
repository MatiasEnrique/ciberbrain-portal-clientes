import type React from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/query-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CiberBrain",
  description: "Sistema CiberBrain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </QueryProvider>
  );
}
