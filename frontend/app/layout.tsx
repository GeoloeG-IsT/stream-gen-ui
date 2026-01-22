import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ViewRawProvider } from "@/contexts/ViewRawContext";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "stream-gen-ui",
  description: "Streaming UI comparison: FlowToken vs llm-ui vs Streamdown",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <ViewRawProvider>{children}</ViewRawProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
