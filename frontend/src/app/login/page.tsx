"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Library } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login({ email, password });
    if (success) {
      router.push("/collection");
    } else {
      setError("Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-on-background p-4 sm:p-6">
      <Link href="/" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity">
        <Library className="w-8 h-8" />
        <span className="font-serif font-bold text-2xl tracking-tight text-on-surface">Cozy Library</span>
      </Link>

      <div className="w-full max-w-[450px] bg-surface p-6 sm:p-8 rounded-xl shadow-lg border border-stone-200">
        <h1 className="font-serif text-3xl font-bold mb-2 text-center text-on-surface">Welcome Back</h1>
        <p className="text-secondary mb-8 text-center">Sign in to access your collection.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm text-center border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-on-surface">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-on-surface">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-medium py-3 rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary border-t border-stone-100 pt-6">
          Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}