"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "../store/authSlice";
import { Sparkles, Save, ShieldAlert, CheckCircle2 } from "lucide-react";

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

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [profilePic, setProfilePic] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [prevUser, setPrevUser] = useState(null);

  if (user && user._id !== prevUser?._id) {
    setPrevUser(user);
    setProfilePic(user.profilePic || "");
    setBio(user.bio || "");
    setSkillsInput(user.skills ? user.skills.join(", ") : "");
  }

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const body = {
      profilePic,
      bio,
      skills,
    };

    if (password) {
      body.password = password;
    }

    try {
      const res = await fetch("/api/auth/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        dispatch(setUser(data.user));
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setPassword(""); // Clear password field
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Network error. Please try again later." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Edit Form */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
              Edit Your Profile
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Customize how other developers see you on DevTinder.
            </p>
          </div>

          {/* Success / Error Messages */}
          {message && (
            <div
              className={`flex items-center gap-2.5 p-4 rounded-xl border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              } text-sm animate-in fade-in slide-in-from-top-1 duration-200`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Profile Picture URL
              </label>
              <input
                type="url"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your coding journey..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, Node.js, TypeScript, Go"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Change Password (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Card Preview */}
        <div className="lg:col-span-5 sticky top-24 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/15 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Live Preview
            </span>
          </div>

          <div className="w-full max-w-sm glass-card rounded-3xl overflow-hidden border border-white/5 group premium-hover-card">
            {/* Image container */}
            <div className="relative h-80 w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  profilePic ||
                  "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180"
                }
                alt={user.userName}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://tse1.mm.bing.net/th/id/OIP.hyLsJh3chqROf-s7RoNsEAHaHX?pid=Api&P=0&h=180";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 bg-zinc-950/40">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                  {user.userName}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mt-1">
                  {getDynamicRole(
                    skillsInput
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0)
                  )}
                </p>
              </div>

              {bio && (
                <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                  &ldquo;{bio}&rdquo;
                </p>
              )}

              {/* Skills Badges */}
              {skillsInput.trim().length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsInput
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0)
                      .slice(0, 8)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-300 font-semibold tracking-wide"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
