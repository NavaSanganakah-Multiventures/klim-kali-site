"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  Heart,
  Users,
  Radio,
  LogOut,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/donations", label: "Donations", icon: Heart },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/live", label: "Live Darshan", icon: Radio },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-900 transition-colors"
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </>
  );
}

function Brand() {
  return (
    <div>
      <h1 className="font-bold text-white">क्लीं काली</h1>
      <p className="text-[10px] md:text-xs text-orange-400 mt-0.5">Admin Panel</p>
    </div>
  );
}

export function AdminNavbar() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-orange-950 text-orange-100 flex-col shrink-0">
        <div className="p-6 border-b border-orange-900">
          <Brand />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-orange-900">
          <div className="mb-3 text-sm truncate">{user?.email}</div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-orange-300 hover:text-white text-sm"
            suppressHydrationWarning
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-orange-950 text-orange-100 border-b border-orange-900">
        <div className="flex items-center justify-between px-4 py-3">
          <Brand />
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-orange-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="w-64 min-h-full bg-orange-950 text-orange-100 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-orange-900 flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-orange-900 transition-colors"
                aria-label="Close menu""
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <NavLinks onClick={() => setIsOpen(false)} />
            </nav>
            <div className="p-4 border-t border-orange-900">
              <div className="mb-3 text-sm truncate">{user?.email}</div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 text-orange-300 hover:text-white text-sm"
                suppressHydrationWarning
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}
