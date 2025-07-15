import type React from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/navbar";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="min-h-screen bg-background">
                <Navbar />
                <main className="px-6 pt-4">
                  <div className="mx-auto max-w-6xl">{children}</div>
                </main>
              </div>
              <Toaster position="top-center" />
            </ThemeProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
