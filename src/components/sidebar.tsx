"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, TrendingUp, Menu } from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Mission", href: "/", icon: Home },
  { name: "Trading", href: "/trading", icon: TrendingUp },
];

function NavItems({ pathname }: { pathname: string }) {
  return (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
              isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden fixed top-3 left-3 z-50 rounded-md bg-card border px-2 py-2">
        <Menu className="h-4 w-4" />
      </button>

      <aside className="hidden md:flex h-screen w-64 flex-col bg-card border-r notion-sidebar">
        <div className="h-14 px-4 flex items-center border-b">
          <h1 className="text-sm font-semibold tracking-wide">MISSION CONTROL</h1>
        </div>
        <div className="p-3 space-y-1 flex-1 overflow-auto"><NavItems pathname={pathname} /></div>
        <div className="p-4 border-t text-xs text-muted-foreground">Clean mode · single focus</div>
      </aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <aside className="h-full w-72 bg-card border-r p-3" onClick={(e) => e.stopPropagation()}>
            <div className="h-10 px-2 flex items-center text-sm font-semibold">MISSION CONTROL</div>
            <div className="space-y-1"><NavItems pathname={pathname} /></div>
          </aside>
        </div>
      )}
    </>
  );
}
