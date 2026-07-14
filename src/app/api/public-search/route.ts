import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || typeof q !== "string" || q.trim().length === 0) {
    return NextResponse.json({ message: "Query pencarian tidak boleh kosong" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}api/public/search?q=${encodeURIComponent(q.trim())}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Backend search failed");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
