"use client";

import { supabase } from "@/lib/supabase";
import { useState , useEffect } from "react";

export default function BookmarkFrom() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeUrl = (u: string) => {
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      return `https://${u}`;
    }
    return u;
  };

  const fetchTitle = async (u: string) => {
    try {
      const res = await fetch(`/api/metadata?url=${encodeURIComponent(u)}`);
      const data = await res.json();
      if (data?.title && !data.title.toLowerCase().includes("access denied")) {
        setTitle(data.title);
      }
    } catch {}
  };

  useEffect(() => {
    if(!url || title ) return;

    const t = setTimeout(() => {
      fetchTitle(normalizeUrl(url));
    } , 600);

    return () => clearTimeout(t);
  })

  const add = async () => {
    if (!url) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const finalUrl = normalizeUrl(url);

    const { data : existing} = await supabase
      .from("bookmarks")
      .select("id")
      .eq("url" , finalUrl)
      .limit(1)

    if(existing && existing.length > 0) {
      alert("This bookmark already exists.")
      setLoading(false);
      return;
    }

    let finalTitle = title;

    if(!finalTitle) {
      try{
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(finalUrl)}`);

        const data = await res.json();
        if (data?.title && !data.title.toLowerCase().includes("access denied")) {
          finalTitle = data.title;
        } else {
          finalTitle = "";
        }

        setTitle(finalTitle);
      }catch{
        finalTitle = finalUrl
      }
    }

    const { error } = await supabase.from("bookmarks").insert({
      title: finalTitle,
      url: finalUrl,
      user_id: user?.id,
    });

    if (error) console.error(error);

    setTitle("");
    setUrl("");
    setLoading(false);
  };

  return (
    <div className="mb-6 flex gap-2">
      <input
        placeholder="Paste a URL (title auto-fills)"
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") add();
        }}
        className="flex-1 rounded border border-zinc-800 bg-black p-2 text-sm text-white placeholder:text-zinc-500"
      />

      <input
        placeholder="Title (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") add();
        }}
        className="flex-1 rounded border border-zinc-800 bg-black p-2 text-sm text-white placeholder:text-zinc-500"
      />

      <button
        onClick={add}
        disabled={loading}
        className="rounded cursor-pointer bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition"
      >
        {loading ? "Saving..." : "Add"}
      </button>
    </div>
  );
}