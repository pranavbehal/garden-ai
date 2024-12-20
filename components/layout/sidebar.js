import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  Cloud,
  PlusCircle,
  Settings,
  Menu,
} from "lucide-react";

const mainNav = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Chat Assistant",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Local Hub",
    href: "/local-hub",
    icon: Cloud,
  },
];

const quickActions = [
  {
    title: "Add Plant",
    href: "/plants/new",
    icon: PlusCircle,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }) {
  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold tracking-tight">Garden AI</h2>
            <button className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Quick Actions
          </h2>
          <div className="space-y-1">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
