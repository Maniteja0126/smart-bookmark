import { NextResponse } from "next/server";

export async function GET(req : Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if(!url) {
        return NextResponse.json({error : "Missing url"} , {status : 400});
    }

    try {
        const res = await fetch(url , {
            headers : {
                "User-Agent" : "Mozilla/5.0 (SmartBookmarksBot)"
            }
        });

        const html = await res.text();

        let title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? null;

        if (!title) {
            title = html.match(
                /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
              )?.[1] ?? null;
        }
    
        if (title) {
            title = title
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'");
        }
          

        return NextResponse.json({title});
    } catch (error) {
        return NextResponse.json({title : null})
    }
}