"use client";

import { useEffect , useState } from "react";
import { supabase } from "@/lib/supabase";
import BookmarkFrom from "@/components/BookmarkFrom";

export default function Dashboard() {
    const [bookamrks , setBookmarks] = useState<any[]>([]);
    const [query , setQuery] = useState("");

    const fetchBookmarks = async () => {
        const { data } = await supabase.from("bookmarks").select("*").order("created_at");
        setBookmarks(data || []);
    };

    useEffect(() => {
      let channel: any;

      const setup = async () => {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          window.location.href = "/login";
          return;
        }

        supabase.realtime.setAuth(data.session.access_token);

        await fetchBookmarks();

        channel = supabase
          .channel("bookmarks")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookmarks" },
            () => {
              fetchBookmarks();
            }
          )
          .subscribe();
      };

      setup();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!session) window.location.href = "/login";
      });

      return () => {
        subscription.unsubscribe();
        if (channel) supabase.removeChannel(channel);
      };
    }, []);


    return (
      <div className="mx-auto max-w-2xl p-6 text-white">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Smart Bookmarks</h1>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>

        <BookmarkFrom />

        <input
          placeholder="Search bookmarks..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="mb-6 w-full rounded border border-zinc-800 bg-black p-2 text-sm placeholder:text-zinc-500"
        />

        {bookamrks.length === 0 && (
          <div className="mt-12 text-center text-sm text-zinc-500">
            No bookmarks yet — add your first one above.
          </div>
        )}

        {bookamrks
          .filter(b =>
            b.title.toLowerCase().includes(query.toLowerCase())
          )
          .map(b => {
            let domain = "";
            try {
              domain = new URL(b.url).hostname;
            } catch {}

            return (
              <div
                key={b.id}
                className="mb-3 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 hover:bg-zinc-900 transition"
              >
                <div className="flex items-center gap-3">
                  {domain && (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}`}
                      className="h-4 w-4"
                    />
                  )}

                  <div className="flex flex-col">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-400 hover:underline"
                    >
                      {b.title}
                    </a>

                    {domain && (
                      <span className="text-xs text-zinc-500">{domain}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const { error } = await supabase
                      .from("bookmarks")
                      .delete()
                      .eq("id", b.id);

                    if (error) console.log("DELETE Error:", error);
                  }}
                  className="text-xs cursor-pointer text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            );
          })}
      </div>
    );
}