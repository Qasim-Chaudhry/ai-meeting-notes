"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Button from "@/components/ui/Button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* BADLAV 1: Logo ko clickable banaya — user state ke mutabik redirect karega */}
        <Link href={user ? "/dashboard" : "/"}>
          <h1 className="text-xl font-semibold text-gray-900 cursor-pointer hover:opacity-80 transition-opacity">
            AI Meeting Notes
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          {user && (
            <nav className="flex gap-6 text-sm font-medium text-gray-600">
              {/* BADLAV 2: Meetings link ab "/" ki jagah "/dashboard" par le jayega */}
              <Link href="/dashboard" className="hover:text-gray-900">
                Meetings
              </Link>
              <Link href="/actions" className="hover:text-gray-900">
                Actions
              </Link>
            </nav>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
