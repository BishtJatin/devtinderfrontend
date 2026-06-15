"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/authSlice";
import { Lock, Mail, User as UserIcon, ShieldAlert, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  // If already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!emailId || !password) {
      setLocalError("Please fill in all required fields.");
      return;
    }

    if (!validateEmail(emailId)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (!isLogin) {
      if (!userName) {
        setLocalError("Username is required for registration.");
        return;
      }
      if (userName.length < 3 || userName.length > 10) {
        setLocalError("Username must be between 3 and 10 characters.");
        return;
      }
    }

    setBtnLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signUp";
    const body = isLogin
      ? { emailId, password }
      : { userName, emailId, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Fetch profile to get full user object
        const profileRes = await fetch("/api/auth/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.user) {
            dispatch(setUser(profileData.user));
            router.push("/");
          }
        }
      } else {
        setLocalError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setLocalError("Network error. Please try again later.");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 space-y-6">
        {/* Title / Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-xs text-zinc-400 tracking-wide">
            {isLogin
              ? "Sign in to connect with awesome developers"
              : "Join the community of developers on DevTinder"}
          </p>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span className="font-medium">{localError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-400/80">
                  <UserIcon className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. dev_ninja"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-400/80">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                placeholder="dev@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-400/80">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl glass-input text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full py-3 mt-5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {btnLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setLocalError(null);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
          >
            {isLogin
              ? "New to DevTinder? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
