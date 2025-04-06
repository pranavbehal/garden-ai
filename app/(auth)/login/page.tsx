"use client";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M8 3h8l4 9v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9l4-9" />
            <path d="M12 12v6" />
            <path d="M9 18s1.5-2 3-2 3 2 3 2" />
            <path d="M6 12h12" />
          </svg>
          Garden AI
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Enhance your plants&apos; growth with detailed insights and
              overviews
            </p>
            <footer className="text-sm">
              Your personal gardening assistant - 2009-901
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
