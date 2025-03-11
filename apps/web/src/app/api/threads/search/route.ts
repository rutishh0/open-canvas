// apps/web/src/app/api/threads/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // parse the request body
  const body = await req.json();
  // do your logic
  return NextResponse.json({ threads: [] });
}
