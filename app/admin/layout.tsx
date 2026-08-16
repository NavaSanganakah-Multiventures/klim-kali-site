"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AdminNavbar } from "@/components/AdminNavbar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      window.location.href = "/";
    }
  }, [user, loading]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-orange-50">
      <AdminNavbar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}