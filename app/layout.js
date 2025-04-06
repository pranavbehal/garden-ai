import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Garden AI - Your Smart Gardening Assistant",
  description:
    "AI-powered gardening assistant to help you grow and maintain your plants.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://cdn.userway.org/widget.js"
          data-account="FSY3fD98w9"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <SettingsProvider>
            <div className="flex h-screen overflow-hidden">
              {/* <Sidebar className="w-64 border-r" /> */}
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
            <Toaster />
            <Analytics />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
