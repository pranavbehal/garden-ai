import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Garden AI - Your Smart Gardening Assistant",
  description:
    "AI-powered gardening assistant to help you grow and maintain your plants.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* UserWay Accessibility Widget Implementaion for All Pages*/}
      <head>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="FSY3fD98w9"
        ></Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex h-screen overflow-hidden">
          <Sidebar className="w-64 border-r" />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
