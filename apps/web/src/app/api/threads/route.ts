// apps/web/src/app/api/threads/route.ts
import { NextResponse } from "next/server";
import { verifyUserAuthenticated } from "@/lib/supabase/verify_user_server";

export async function POST(request: Request) {
  try {
    const auth = await verifyUserAuthenticated();

    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    
    // Create a basic thread with a unique ID
    const thread = {
      thread_id: `thread-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_id: auth.user.id,
      // Include any other fields from the request body
      ...body
    };
    
    // In a production app, you would store this in your database
    // For now, just return the thread object
    
    return NextResponse.json({ thread });
  } catch (error: any) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}