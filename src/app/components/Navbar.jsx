"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { Users, User as UserIcon, MessageSquare, LogOut, Menu, X, Heart } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { requests } = useSelector((state) => state.requests);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navbar on login page
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        dispatch(clearUser());
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { href: "/", label: "Feed", icon: Heart },
    { href: "/requests", label: "Requests", icon: Users, badge: requests.length },
    { href: "/connections", label: "Matches & Chat", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-widest transition-all group-hover:drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            DevTinder
          </span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-indigo-400 bg-indigo-500/5 border border-indigo-500/15"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {link.badge && link.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-black text-slate-950 ring-2 ring-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-pulse">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}

        {/* Profile Dropdown / Login */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-0.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.profilePic || "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180"}
                  alt={user.userName}
                  className="w-9 h-9 rounded-full object-cover border border-indigo-500/40 hover:border-indigo-400 transition-colors shadow-md shadow-indigo-500/5"
                />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-zinc-950/95 border border-white/5 backdrop-blur-xl py-1.5 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-white/5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Logged in as</p>
                      <p className="text-sm font-semibold text-zinc-200 truncate mt-0.5">
                        {user.userName}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Edit Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : pathname !== "/login" ? (
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              Sign In
            </Link>
          ) : null}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-zinc-200 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {user && mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/5 space-y-2 animate-in slide-in-from-top-3 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? "text-indigo-400 bg-indigo-500/5 border border-indigo-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {link.label}
                </div>
                {link.badge && link.badge > 0 ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-black text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.5)] animate-pulse">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
