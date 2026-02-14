"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/dashboard");
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Smart Bookmarks
        </h1>

        <p className="mb-8 text-lg text-zinc-400">
          Save, search, and sync your bookmarks in real time across tabs.
          Built with Next.js + Supabase.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: "google",
              })
            }
            className="rounded bg-white px-6 py-3 font-medium text-black hover:bg-zinc-200 transition"
          >
            Sign in with Google
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded border border-zinc-700 px-6 py-3 hover:bg-zinc-900 transition"
          >
            View Dashboard
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded border border-zinc-800 p-4">
            <h3 className="mb-2 font-semibold">Realtime Sync</h3>
            <p className="text-sm text-zinc-400">
              Bookmarks update instantly across all tabs.
            </p>
          </div>

          <div className="rounded border border-zinc-800 p-4">
            <h3 className="mb-2 font-semibold">Private by Design</h3>
            <p className="text-sm text-zinc-400">
              Each user sees only their own bookmarks using RLS.
            </p>
          </div>

          <div className="rounded border border-zinc-800 p-4">
            <h3 className="mb-2 font-semibold">One‑Click Save</h3>
            <p className="text-sm text-zinc-400">
              Chrome extension support for instant bookmarking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}