"use client";

import { supabase } from "@/lib/supabase";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">
          Welcome
        </h1>

        <p className="mb-6 text-sm text-zinc-400">
          Sign in to access your smart bookmarks.
        </p>

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
            })
          }
          className="flex w-full items-center justify-center cursor-pointer gap-2 rounded bg-white px-4 py-3 font-medium text-black hover:bg-zinc-200 transition"
        >
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Your bookmarks are private and synced in realtime.
        </p>
      </div>
    </div>
  );
}