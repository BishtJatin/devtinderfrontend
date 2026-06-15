"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { setUser, clearUser, setLoading } from "../store/authSlice";
import { setRequests } from "../store/requestSlice";
import Navbar from "./Navbar";

export default function AppLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fetch current user profile
        const res = await fetch("/api/auth/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            dispatch(setUser(data.user));

            // Fetch pending requests count as well
            const reqRes = await fetch("/api/auth/requests/received");
            if (reqRes.ok) {
              const reqData = await reqRes.json();
              if (reqData.success && reqData.requests) {
                dispatch(setRequests(reqData.requests));
              }
            }
          } else {
            dispatch(clearUser());
            if (pathname !== "/login") router.push("/login");
          }
        } else {
          dispatch(clearUser());
          if (pathname !== "/login") router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        dispatch(clearUser());
        if (pathname !== "/login") router.push("/login");
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch, pathname, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712]">
        <div className="relative flex items-center justify-center">
          {/* Outer Ring */}
          <div className="h-20 w-20 animate-spin rounded-full border-2 border-white/5 border-t-indigo-500" />
          {/* Inner Ring (Reverse Spin) */}
          <div className="absolute h-14 w-14 animate-[spin_1s_linear_infinite_reverse] rounded-full border-2 border-white/5 border-t-cyan-500" />
          {/* Center Glow */}
          <div className="absolute text-sm font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-widest drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
            DT
          </div>
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-zinc-400 animate-pulse">Connecting to DevTinder...</p>
      </div>
    );
  }

  const isChatPage = pathname === "/connections";

  return (
    <>
      <Navbar />
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${isChatPage ? "py-2 sm:py-6" : "py-6"}`}>
        {children}
      </main>
    </>
  );
}
