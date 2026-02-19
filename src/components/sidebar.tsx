"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  TrendingUp,
  Calendar,
  Brain,
  Users,
  Monitor,
  CheckSquare,
} from "lucide-react";

const navigation = [
  { name: "Tasks", href: "/", icon: CheckSquare },
  { name: "Trading", href: "/trading", icon: TrendingUp },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Memory", href: "/memory", icon: Brain },
  { name: "Team", href: "/team", icon: Users },
  { name: "Office", href: "/office", icon: Monitor },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-gray-700">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-foreground">Mission Control</h1>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Stuart Online</span>
        </div>
      </div>
    </div>
  );
}