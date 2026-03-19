"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { mockAccounts } from "@/lib/mockData";
import { BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    const match = mockAccounts.find(
      (a) =>
        a.username.toLowerCase() === username.trim().toLowerCase() &&
        a.password === password
    );

    if (!match) {
      setError("Username or password is incorrect. Check with a parent.");
      return;
    }

    setError("");
    setLoading(true);
    setTimeout(() => {
      router.push("/today");
    }, 700);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0d1117" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#534AB7] flex items-center justify-center shadow-lg mb-4">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-foreground font-bold text-2xl tracking-tight">My Learning Space</h1>
          <p className="text-muted-foreground text-sm mt-1">Homeschool OS — Student</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}>
          <h2 className="text-foreground font-semibold text-base mb-1">Welcome back!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Enter the username and password your parent set up for you.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-foreground font-medium text-sm mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Your username"
                autoComplete="username"
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium text-sm mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-border rounded-lg px-4 py-2.5 pr-11 text-sm text-foreground bg-background placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#f85149", backgroundColor: "#1c1117", border: "1px solid #3d1a1a" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 bg-[#534AB7] hover:bg-[#4a42a8] text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-sm",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening your workspace…
                </span>
              ) : (
                <>
                  Let&apos;s learn! <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-muted-foreground text-xs text-center mt-5">
            Forgot your password? Ask a parent to reset it.
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 rounded-2xl border px-4 py-3" style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}>
          <p className="text-foreground text-xs font-semibold mb-2">Demo accounts</p>
          <div className="space-y-1">
            {mockAccounts.map((a) => (
              <div key={a.username} className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground capitalize">{a.username}</span>
                <span className="text-muted-foreground font-mono">{a.username} / {a.password}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
