"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFeed, removeUserFromFeed, setFeedLoading } from "./store/feedSlice";
import { X, Heart, Sparkles, UserCheck, Award } from "lucide-react";

const getDynamicRole = (skills) => {
  if (!skills || skills.length === 0) return "Software Engineer";
  const lowercaseSkills = skills.map(s => s.toLowerCase());
  const hasFrontend = lowercaseSkills.some(s => 
    s.includes("react") || s.includes("next") || s.includes("vue") || s.includes("angular") || 
    s.includes("html") || s.includes("css") || s.includes("javascript") || s.includes("frontend") ||
    s.includes("tailwind")
  );
  const hasBackend = lowercaseSkills.some(s => 
    s.includes("node") || s.includes("express") || s.includes("python") || s.includes("django") || 
    s.includes("flask") || s.includes("java") || s.includes("spring") || s.includes("go") || 
    s.includes("rust") || s.includes("c#") || s.includes("cpp") || s.includes("backend") || 
    s.includes("mongodb") || s.includes("sql") || s.includes("postgres") || s.includes("firebase")
  );
  if (hasFrontend && hasBackend) return "Fullstack Developer";
  if (hasFrontend) return "Frontend Developer";
  if (hasBackend) return "Backend Developer";
  return "Software Engineer";
};

export default function FeedPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { feedUsers, loading } = useSelector((state) => state.feed);

  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipingId, setSwipingId] = useState(null);

  // Fetch Feed
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchFeed = async () => {
      dispatch(setFeedLoading(true));
      try {
        const res = await fetch("/api/auth/feed");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.users) {
            dispatch(setFeed(data.users));
          }
        }
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        dispatch(setFeedLoading(false));
      }
    };

    fetchFeed();
  }, [user, dispatch, router]);

  const handleSwipe = useCallback(async (direction, targetUserId) => {
    if (swipingId) return; // prevent spamming

    setSwipingId(targetUserId);
    setSwipeDirection(direction);

    // Backend status mapping: "left" -> "ignored", "right" -> "interested"
    const status = direction === "left" ? "ignored" : "interested";

    try {
      await fetch(`/api/auth/send/${status}/${targetUserId}`, {
        method: "POST",
      });

      // Wait for swipe animation to finish before removing from Redux store
      setTimeout(() => {
        dispatch(removeUserFromFeed(targetUserId));
        setSwipeDirection(null);
        setSwipingId(null);
      }, 400);

    } catch (err) {
      console.error(`Failed to swipe ${status}:`, err);
      setSwipeDirection(null);
      setSwipingId(null);
    }
  }, [swipingId, dispatch]);

  const currentProfile = feedUsers[0];

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentProfile || swipingId) return;
      if (e.key === "ArrowLeft") {
        handleSwipe("left", currentProfile._id);
      } else if (e.key === "ArrowRight") {
        handleSwipe("right", currentProfile._id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentProfile, swipingId, handleSwipe]);

  if (!user) return null;

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-6 w-full px-4 sm:px-0">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/5 border-t-indigo-500" />
          <p className="mt-4 text-zinc-500 text-sm animate-pulse tracking-wide font-medium">Searching for developers nearby...</p>
        </div>
      ) : currentProfile ? (
        <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-6 animate-in fade-in duration-300">
          {/* Headline badge */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/15 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Find Your Partner
            </span>
          </div>

          {/* Profile Card Container */}
          <div
            className={`w-full glass-card rounded-3xl overflow-hidden border border-white/5 transition-all duration-350 relative premium-hover-card shadow-2xl ${
              swipingId === currentProfile._id
                ? swipeDirection === "left"
                  ? "animate-swipe-left"
                  : "animate-swipe-right"
                : "hover:scale-[1.015]"
            }`}
          >
            {/* Image section */}
            <div className="relative h-80 sm:h-[380px] w-full overflow-hidden bg-zinc-950 flex items-center justify-center select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  currentProfile.profilePic ||
                  "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180"
                }
                alt={currentProfile.userName}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180";
                }}
              />
              
              {/* Ready to code badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-black text-emerald-400 tracking-wider uppercase backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ready to Code
              </div>

              {/* Name and age overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent p-6 pt-12 flex flex-col justify-end">
                <h3 className="text-2xl font-black text-white tracking-wide">
                  {currentProfile.userName}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mt-1">
                  {getDynamicRole(currentProfile.skills)}
                </p>
              </div>
            </div>

            {/* IDE-themed Profile Info */}
            <div className="bg-[#0b0f19] border-t border-white/5 font-mono text-[10px] sm:text-xs text-zinc-300">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/30 border-b border-white/5 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-[#0b0f19] border-x border-t border-white/5 rounded-t-lg text-[9px] sm:text-[10px] text-zinc-400">
                  <span className="text-amber-400 font-bold">JS</span>
                  developer.js
                </div>
                <div className="w-10" />
              </div>

              {/* Editor Console */}
              <div className="p-5 space-y-1.5 leading-relaxed overflow-x-auto whitespace-pre">
                <div>
                  <span className="text-zinc-600 select-none mr-3">1</span>
                  <span className="text-fuchsia-400">const</span> <span className="text-cyan-300">developer</span> = &#123;
                </div>
                <div>
                  <span className="text-zinc-600 select-none mr-3">2</span>
                  <span className="pl-4 text-zinc-400">role:</span> <span className="text-emerald-300">&quot;{getDynamicRole(currentProfile.skills)}&quot;</span>,
                </div>
                {currentProfile.skills && currentProfile.skills.length > 0 && (
                  <div>
                    <span className="text-zinc-600 select-none mr-3">3</span>
                    <span className="pl-4 text-zinc-400">techStack:</span> <span className="text-yellow-400">[</span>
                    {currentProfile.skills.slice(0, 5).map((skill, idx) => (
                      <span key={idx}>
                        <span className="text-emerald-300">&quot;{skill}&quot;</span>
                        {idx < Math.min(currentProfile.skills.length, 5) - 1 ? <span className="text-zinc-400">, </span> : ""}
                      </span>
                    ))}
                    <span className="text-yellow-400">]</span>,
                  </div>
                )}
                {currentProfile.bio && (
                  <div className="flex items-start">
                    <span className="text-zinc-600 select-none mr-3 flex-shrink-0">4</span>
                    <div className="pl-4">
                      <span className="text-zinc-400">bio:</span> <span className="text-amber-200/90">&quot;{currentProfile.bio}&quot;</span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-zinc-600 select-none mr-3">5</span>
                  &#125;;
                </div>
              </div>
            </div>
          </div>

          {/* Swipe Buttons */}
          <div className="flex justify-center items-center gap-5 mt-2">
            <button
              onClick={() => handleSwipe("left", currentProfile._id)}
              disabled={!!swipingId}
              className="h-14 w-14 rounded-full border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/5 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSwipe("right", currentProfile._id)}
              disabled={!!swipingId}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Keyboard Shortcuts Helper */}
          <div className="hidden sm:flex items-center gap-4 text-zinc-500 text-[10px] mt-1 select-none tracking-wider uppercase font-bold">
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-zinc-900 border border-white/5 rounded-lg text-[9px] font-mono shadow-[0_2px_0_rgba(255,255,255,0.03)] text-zinc-300">←</kbd>
              <span>Ignore</span>
            </div>
            <div className="h-3 w-px bg-white/5" />
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-zinc-900 border border-white/5 rounded-lg text-[9px] font-mono shadow-[0_2px_0_rgba(255,255,255,0.03)] text-zinc-300">→</kbd>
              <span>Match</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/5 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-center text-indigo-400 animate-pulse shadow-md shadow-indigo-500/5">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">End of the Feed</h3>
            <p className="text-sm text-zinc-400 max-w-sm mt-1 mx-auto leading-relaxed">
              You&apos;ve swiped on all available profiles. Check back later or update your profile to find new matches!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
