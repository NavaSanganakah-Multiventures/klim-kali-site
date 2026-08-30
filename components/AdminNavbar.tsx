"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, CalendarCheck, Heart, Users, Radio, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/donations", label: "Donations", icon: Heart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/live", label: "Live Darshan", icon: Radio },
];

export function AdminNavbar() {
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-orange-950 text-orange-100 flex flex-col">
      <div className="p-6 border-b border-orange-900">
        <h1 className="text-xl font-bold text-white">काली माता मंदिर</h1>
        <p className="text-xs text-orange-400 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-orange-900 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
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
  );
}
