"use client";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

// Navbar Component

// Footer Component (unchanged)


export default function RootLayout({
  children,
}) {





  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen bg-white">
            <main className="">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}