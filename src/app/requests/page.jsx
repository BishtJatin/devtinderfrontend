"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setRequests, removeRequest, setRequestLoading } from "../store/requestSlice";
import { Check, X, Users } from "lucide-react";

export default function RequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { requests, loading } = useSelector((state) => state.requests);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchRequests = async () => {
      dispatch(setRequestLoading(true));
      try {
        const res = await fetch("/api/auth/requests/received");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.requests) {
            dispatch(setRequests(data.requests));
          }
        }
      } catch (err) {
        console.error("Failed to fetch requests:", err);
      } finally {
        dispatch(setRequestLoading(false));
      }
    };

    fetchRequests();
  }, [user, dispatch, router]);

  const handleReview = async (status, requestId) => {
    try {
      const res = await fetch(`/api/auth/review/${status}/${requestId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          dispatch(removeRequest(requestId));
        }
      }
    } catch (err) {
      console.error(`Failed to review request as ${status}:`, err);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-grow flex flex-col items-center py-6 w-full max-w-4xl mx-auto">
      <div className="w-full text-left mb-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
          Connection Requests
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review developer match requests that have shown interest in connecting with you.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/5 border-t-indigo-500" />
          <p className="mt-3 text-zinc-500 text-sm tracking-wide">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh] w-full glass-card rounded-3xl p-8 text-center border border-white/5">
          <div className="h-14 w-14 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">No Pending Requests</h3>
          <p className="text-sm text-zinc-400 max-w-md mt-1 leading-relaxed">
            You don&apos;t have any incoming requests at the moment. Keep swiping on the feed to find potential matches!
          </p>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {requests.map((req) => {
            const requester = req.fromUserId;
            if (!requester) return null;
            return (
              <div
                key={req._id}
                className="w-full glass-card rounded-3xl p-5 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:scale-[1.01] hover:border-white/10 animate-in fade-in duration-300"
              >
                {/* Profile Information */}
                <div className="flex gap-4 items-start md:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={requester.profilePic || "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180"}
                    alt={requester.userName}
                    className="w-16 h-16 rounded-full object-cover border border-indigo-500/20 flex-shrink-0"
                    onError={(e) => {
                      e.target.src =
                        "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180";
                    }}
                  />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white tracking-wide">{requester.userName}</h3>
                    {requester.bio && (
                      <p className="text-sm text-zinc-400 italic line-clamp-2 border-l border-white/10 pl-2">
                        &ldquo;{requester.bio}&rdquo;
                      </p>
                    )}
                    {requester.skills && requester.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {requester.skills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[10px] font-semibold text-indigo-300 tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Accept / Reject Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto border-t border-white/5 md:border-none pt-4 md:pt-0 justify-end">
                  <button
                    onClick={() => handleReview("rejected", req._id)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 text-sm font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview("accepted", req._id)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/15 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
